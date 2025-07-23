<!--
 * @Author: Lemon C
 * @Date: 2025-07-03 11:42:15
 * @LastEditTime: 2025-07-23 09:46:30
-->
<template>
    <base-view>
        <div class="tree-container">
            <scene-tree
                v-if="state_store.shareType == 2"
                :sceneId="state_store.sceneId"
                :camToWater="re_camToWater"
                :camToExtrude="re_camToExtrude"
                :camToElem="re_camToElem"
                :camToDataSet="re_camToDataSet"
                :waterVisible="re_waterVisible"
                :extrudeVisible="re_extrudeVisible"
                :dataSetVisible="re_dataSetVisible"
                :elemVisible="re_elemVisible"></scene-tree>
            <empty-comp v-else></empty-comp>
        </div>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import EmptyComp from '@/components/Empty/EmptyComp.vue';
import SceneTree from '@/components/Tree/SceneTree.vue';
import { useStateStore } from '@/stores/state';

const state_store = useStateStore();
const NativeBridge = (window as any).$reapi;

onMounted(() => {
    NativeBridge.registerAppMsg(handleMobileMessage);
});

// 处理从 移动端 接收的消息
const handleMobileMessage = (message: any) => {
    console.log('收到 移动端 消息:', message);
    // 更新 Vue 状态或执行其他操作
};

// MARK Engine 定位水面
const re_camToWater = (e: any) => {
    NativeBridge.setCamLocToWater({ waterNameList: e });
};

// MARK Engine 定位挤出
const re_camToExtrude = (e: any) => {
    NativeBridge.setCamLocToExtrude({ extrudeIdst: e });
};

// MARK Engine 定位数据集
const re_camToDataSet = (dataSetList: any, isClearSel: boolean) => {
    if (isClearSel) {
        NativeBridge.delAllSelElemss();
    }

    const terrainType = [10, 13, 21, 22];
    if (dataSetList.length === 1) {
        let dataSetInfo = dataSetList[0];
        let dataSetId = dataSetInfo.dataSetId;
        let locType = 'CAM_DIR_DEFAULT';
        if (terrainType.includes(dataSetInfo.dataSetType)) {
            locType = 'CAM_DIR_TOP';
        } else {
            locType = 'CAM_DIR_TOPRIGHTBACK';
        }
        NativeBridge.locDataSet({ dataSetId: dataSetId, backDepth: 1.0, locType: locType });
    } else {
        let bbox = handle_mergeBBox(dataSetList);
        let isIncludesTerrainType = dataSetList.some((el: any) => terrainType.includes(el.dataSetType));
        let locType = 'CAM_DIR_DEFAULT';
        if (isIncludesTerrainType) {
            locType = 'CAM_DIR_TOP';
        } else {
            locType = 'CAM_DIR_TOPRIGHTBACK';
        }
        NativeBridge.setCamLocToBound({ arrBound: bbox, backDepth: 1.0, locType: locType });
    }
};

// MARK Engine 定位单构件
const re_camToElem = (dataSetList: any, isFocus: boolean, isHighLight: boolean) => {
    NativeBridge.delAllSelElems();

    if (isFocus) {
        let locIDList: any = [];
        dataSetList.forEach((item: any) => {
            let obj = {
                dataSetId: item.dataSetId,
                elemIdList: item.elemIds,
            };
            locIDList.push(obj);
        });

        NativeBridge.locElem({ locIDList: locIDList, backDepth: 1.0, locType: 'CAM_DIR_TOPRIGHTBACK' });
    }

    if (isHighLight) {
        dataSetList.forEach((item: any) => {
            NativeBridge.addToSel({ dataSetId: item.dataSetId, elemIdList: item.elemIds });
        });
        NativeBridge.setSelElemsAttr({ elemClr: [254, 64, 7, 180], probeMask: 1, attrValid: true });
    }
};

// MARK Engine 水面显隐
const re_waterVisible = (waterIds: any, visible: boolean) => {
    waterIds.forEach((item: any) => {
        NativeBridge.waterVisible({ waterName: item, visible: visible });
    });
};

// MARK Engine 挤出显隐
const re_extrudeVisible = (extrudeIds: any, visible: boolean) => {
    extrudeIds.forEach((item: any) => {
        NativeBridge.extrudeVisible({ extrudeId: item, visible: visible });
    });
};

// MARK Engine 数据集显隐
const re_dataSetVisible = async (dataSetList: any, visible: boolean) => {
    const elemDataSetType = [17, 18, 19];
    // 用 for...of 替代 forEach，支持异步等待
    for (const item of dataSetList) {
        let { dataSetId, dataSetType } = item;
        if (elemDataSetType.includes(dataSetType)) {
            let elemId = item.elemId;
            re_elemVisible(dataSetId, [elemId], visible);
        } else {
            if (dataSetType !== 0) {
                let terrId = await NativeBridge.getTerrId({ dataSetId: dataSetId });
                if (terrId) {
                    let unitNames = await NativeBridge.getAllUnitNames({ dataSetId: dataSetId });
                    let unitId = unitNames[0] ? unitNames[0] : '';
                    let resType = 'ALL';
                    NativeBridge.setUnitActive({ dataSetId: dataSetId, unitId: unitId, resType: resType, active: visible });
                } else {
                    NativeBridge.setGridValidState({ dataSetId: dataSetId, visible: visible });
                }
            } else {
                re_elemVisible(dataSetId, [], visible);
            }
        }
    }
};

// MARK Engine 构件显隐
const re_elemVisible = (dataSetId: any, childNodeIds: any, visible: boolean) => {
    NativeBridge.delAllSelElems();
    if (visible) {
        NativeBridge.resetElemAttr({ dataSetId: dataSetId, elemIdList: childNodeIds });
    } else {
        NativeBridge.setModelAlpha({ dataSetId: dataSetId, elemIdList: childNodeIds, alpha: 0 });
    }
};

// MARK Data 合并包围盒
const handle_mergeBBox = async (dataSetList: any) => {
    let xValue: any = [];
    let yValue: any = [];
    let zValue: any = [];

    dataSetList.forEach((item: any) => {
        let bbox;
        if (item.dataSetType === 0) {
            bbox = NativeBridge.getBIMDataSetBV({ dataSetId: item.dataSetId });
        } else {
            bbox = NativeBridge.getGridDataSetBV({ dataSetId: item.dataSetId });
        }
        xValue.push(bbox[0], bbox[1]);
        yValue.push(bbox[2], bbox[3]);
        zValue.push(bbox[4], bbox[5]);
    });

    let totalBBox = [
        [Math.min(...xValue), Math.min(...yValue), Math.min(...zValue)],
        [Math.max(...xValue), Math.max(...yValue), Math.max(...zValue)],
    ];

    return totalBBox;
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.tree-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 16px 20px 30px 20px;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
}
</style>
