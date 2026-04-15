<!--
 * @Author: Lemon C
 * @Date: 2025-07-03 11:42:15
 * @LastEditTime: 2026-03-30 11:39:06
-->
<template>
    <base-view :base_appTpWebMsg_callback="handle_appToWebMsg">
        <div class="tree-container">
            <scene-tree
                ref="ref_scene_tree"
                v-if="state_store.shareType == 2"
                :sceneId="state_store.sceneId"
                :camToWater="re_camToWater"
                :camToExtrude="re_camToExtrude"
                :camToMonomer="re_camToMonomer"
                :camToElem="re_camToElem"
                :camToDataSet="re_camToDataSet"
                :waterVisible="re_waterVisible"
                :extrudeVisible="re_extrudeVisible"
                :monomerVisible="re_monomerVisible"
                :dataSetVisible="re_dataSetVisible"
                :elemVisible="re_elemVisible"
                :updateTreeData="re_updateTreeData"></scene-tree>
            <model-tree
                v-else-if="state_store.shareType == 1"
                :sceneId="state_store.sceneId"
                :camToElem="re_camToElem"
                :camToDataSet="re_camToDataSet"
                :dataSetVisible="re_dataSetVisible"
                :elemVisible="re_elemVisible"
                :showRoom="re_showRoom"
                :resetRoom="re_resetRoom"
                :resetElemAttr="re_resetElemAttr"
                :updateTreeData="re_updateTreeData"></model-tree>
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
import ModelTree from '@/components/Tree/ModelTree.vue';
import { useStateStore } from '@/stores/state';

const state_store = useStateStore();
const NativeBridge = (window as any).$reapi;
const ref_scene_tree = ref<InstanceType<typeof SceneTree> | null>(null);

onMounted(() => {
    // setTimeout(() => {
    //     handle_appToWebMsg({ type: 'Listen.loadDataSetFinish' });
    // }, 10000);
});

// MARK App->Web 接收App消息
const handle_appToWebMsg = (msgData: any) => {
    if (msgData) {
        if (msgData.type == 'Listen.loadDataSetFinish') {
            console.log(' -----  >>>   Listen.loadDataSetFinish');
            ref_scene_tree.value?.engine_callback_loadDataSetFinish();
        }
    }
};

// MARK Engine 更新目录树数据
const re_updateTreeData = (e: any) => {
    console.log('re_updateTreeData: ', e);
    NativeBridge.updateTreeData({ treeData: e });
};

// MARK Engine 定位水面
const re_camToWater = (e: any) => {
    NativeBridge.setCamLocToWater({ waterNameList: e });
};

// MARK Engine 定位挤出
const re_camToExtrude = (e: any) => {
    NativeBridge.setCamLocToExtrude({ extrudeIdst: e });
};

// MARK Engine 定位单体化
const re_camToMonomer = async (e: any) => {
    NativeBridge.delFromSelMonomer({ monomerIds: [] });

    const monomerSelAttr = await NativeBridge.getMonomerSelAttr();
    monomerSelAttr.monomerClr = [255, 0, 0, 128];

    NativeBridge.setMonomerSelAttr({ monomerSelAttr: monomerSelAttr });
    NativeBridge.addToSelMonomer({ monomerIds: e });
    NativeBridge.setCamLocToMonomer({ monomerIds: e });
};

// MARK Engine 定位数据集
const re_camToDataSet = async (dataSetList: any, locType: string) => {
    NativeBridge.delAllSelElems();

    if (dataSetList.length === 1) {
        let dataSetInfo = dataSetList[0];
        let dataSetId = dataSetInfo.dataSetId;
        NativeBridge.setCamLocateToDataSet({ dataSetId: dataSetId, backDepth: 2.0, locType: locType });
    } else {
        let bbox = await handle_mergeBBox(dataSetList);
        NativeBridge.setCamLocateToBound({ arrBound: bbox, backDepth: 2.0, locType: locType });
    }
};

// MARK Engine 定位单构件
const re_camToElem = (locIDList: any, locType: string, isHighLight: boolean) => {
    NativeBridge.delAllSelElems();
    NativeBridge.setCamLocateToElem({ locIDList: locIDList, backDepth: 2.0, locType: locType });

    if (isHighLight) {
        locIDList.forEach((item: any) => {
            NativeBridge.addToSelElems({ dataSetId: item.dataSetId, elemIdList: item.elemIdList });
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

// MARK Engine 单体化显隐
const re_monomerVisible = (monomerIds: any, visible: boolean) => {
    NativeBridge.monomerVisible({ monomerIds: monomerIds, visible: visible });
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
                let terrId = await NativeBridge.getDataSetTerrId({ dataSetId: dataSetId });
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
        NativeBridge.setElemAlpha({ dataSetId: dataSetId, elemIdList: childNodeIds, alpha: 0 });
    }
};

// MARK Engine 查看房间
const re_showRoom = async (roomInfo: any) => {
    let dataSetId = state_store.sceneId;
    if (!roomInfo.levelHeightTop) {
        // 重置所有构件颜色，防止切换房间时，上次选中的房间颜色依旧存在
        NativeBridge.resetElemAttr({ dataSetId: dataSetId, elemIdList: [] });
        let visibleElements = await NativeBridge.getDataSetAllElemIDs({ dataSetId: dataSetId, visibalOnly: true });
        NativeBridge.setElemAlpha({ dataSetId: dataSetId, elemIdList: visibleElements, alpha: 30 });
        NativeBridge.delAllSelElems();
        NativeBridge.setElemAttr({ dataSetId: dataSetId, elemIdList: roomInfo.elemIntIds, elemClr: [255, 0, 0, 255] });
        let locIDList = [{ dataSetId: dataSetId, elemIdList: roomInfo.elemIntIds }];
        NativeBridge.setCamLocateToElem({ locIDList: locIDList, backDepth: 2.0, locType: 'CAM_DIR_CURRENT' });
    } else {
        let deltaHeight = roomInfo.levelHeightTop - roomInfo.levelHeightBottom;
        deltaHeight = Number((deltaHeight * 0.6).toFixed(2));
        let bottomHeight = Number(Number(roomInfo.levelHeightBottom).toFixed(2));

        NativeBridge.setClipPlanesContourLineClr({ lineClr: [254, 255, 255, 0] });
        NativeBridge.setClipSpecifyHeight({ dataSetId: dataSetId, topHeight: bottomHeight + deltaHeight, bottomHeight: bottomHeight, single: true });
        // 重置所有构件颜色，防止切换房间时，上次选中的房间颜色依旧存在
        NativeBridge.resetElemAttr({ dataSetId: dataSetId, elemIdList: [] });
        let locIDList = [{ dataSetId: dataSetId, elemIdList: roomInfo.elemIntIds }];
        NativeBridge.setCamLocateToElem({ locIDList: locIDList, backDepth: 2.0, locType: 'CAM_DIR_TOP' });
        NativeBridge.setElemAttr({ dataSetId: dataSetId, elemIdList: roomInfo.elemIntIds, elemClr: [254, 64, 7, 255] });
        NativeBridge.setElemDepthBias({ dataSetId: dataSetId, elemIdList: roomInfo.elemIntIds, depthBias: -0.00002 });
    }
};

// MARK Engine 重置查看房间效果
const re_resetRoom = () => {
    let dataSetId = state_store.sceneId;
    NativeBridge.endClip();
    NativeBridge.resetElemAttr({ dataSetId: dataSetId, elemIdList: [] });
};

// MARK Engine 重置构件颜色和透明度
const re_resetElemAttr = () => {
    NativeBridge.resetElemAttr({ dataSetId: '', elemIdList: [] });
};

// MARK Data 合并包围盒
const handle_mergeBBox = async (dataSetList: any) => {
    let xValue: any = [];
    let yValue: any = [];
    let zValue: any = [];

    for (const item of dataSetList) {
        let bbox;
        if (item.dataSetType === 0) {
            bbox = await NativeBridge.getBIMDataSetBV({ dataSetId: item.dataSetId });
        } else {
            bbox = await NativeBridge.getGridDataSetBV({ dataSetId: item.dataSetId });
        }
        xValue.push(bbox[0][0], bbox[1][0]);
        yValue.push(bbox[0][1], bbox[1][1]);
        zValue.push(bbox[0][2], bbox[1][2]);
    }

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
