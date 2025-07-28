<!--
 * @Author: Lemon C
 * @Date: 2025-07-23 15:16:10
 * @LastEditTime: 2025-07-24 17:20:57
-->
<template>
    <div class="sup-room-comp">
        <el-tree
            class="eltree-area"
            ref="ref_eltree"
            :data="room_treeList"
            :props="defaultProps"
            node-key="nodeId"
            :highlight-current="true"
            :expand-on-click-node="false"
            @node-click="eltree_nodeClick" />
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ElTree } from 'element-plus';
import { ref, onMounted, PropType, watch } from 'vue';

const REService = (window as any).$service;

const props = defineProps({
    sceneId: String,
    room_treeList: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    showRoom: Function,
});

const ref_eltree = ref<InstanceType<typeof ElTree> | null>(null);
const treeList = ref<any[]>([]);
const defaultProps = {
    children: 'nodes',
    label: 'nodeName',
};

watch(
    () => props.room_treeList,
    () => {
        data_update();
    }
);

onMounted(() => {
    data_update();
});

// MARK data 接收数据
const data_update = () => {
    if (!props.room_treeList.length) return;
    treeList.value = props.room_treeList;
};

// MARK service 获取房间构件
const service_getRoomElems = (nodeData: any) => {
    return new Promise<any>((resolve) => {
        let params = {
            dataSetId: props.sceneId,
            childNodeId: nodeData.nodeId,
        };
        REService.getSharedRoomElement(params).then((res: any) => {
            resolve(res.elemIntIds);
        });
    });
};

// MARK service 获取房间信息
const service_getRoomInfo = (elemIntIds: any) => {
    return new Promise<any>((resolve) => {
        let params = {
            dataSetId: props.sceneId,
            elementIntId: '',
        };
        if (elemIntIds.length) {
            params['elementIntId'] = elemIntIds[0] + '';
        }
        REService.getSharedRoomInfo(params).then((res: any) => {
            resolve(res);
        });
    });
};

// MARK eltree 节点被点击
const eltree_nodeClick = async (nodeData: any, node: any) => {
    if (!node.isLeaf) return;

    const elemIntIds = await service_getRoomElems(nodeData);
    const attributeData = await service_getRoomInfo(elemIntIds);

    let roomInfo: any = {};
    for (const item of attributeData) {
        item['paramGroup'] = item.roomParamGroup;
        item.roomParams.forEach((obj: any) => {
            if (obj.roomParamName === 'LevelBottom') {
                roomInfo['levelHeightBottom'] = obj.roomParamValue;
            }
            if (obj.roomParamName === 'LevelTop') {
                roomInfo['levelHeightTop'] = obj.roomParamValue;
            }

            obj['paramName'] = obj.roomParamName;
            obj['paramValue'] = obj.roomParamValue;
            obj['paramType'] = obj.roomParamType;
        });

        item['paramDatas'] = item.roomParams;
    }

    roomInfo['elemIntIds'] = elemIntIds;

    props.showRoom?.(roomInfo);
};

</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-room-comp {
    position: relative;
    width: 100%;
    height: 100%;

    :deep(.eltree-area) {
        position: relative;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background: transparent !important;

        // 重置默认样式（解决el-tree-node上的样式操作影响子界面自定义样式）
        .el-tree-node:focus > .el-tree-node__content,
        .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
            background-color: transparent !important;
            color: inherit !important;
        }

        // 自定义样式（增强优先级）
        .el-tree-node__content {
            background-color: transparent !important;
            .el-tree-node__expand-icon {
                font-size: 20px;
                color: white;
            }

            .el-tree-node__label {
                color: white;
            }
        }

        .el-tree-node.is-current > .el-tree-node__content {
            background-color: rgba(37, 128, 255, 0.1) !important;
        }

        .el-tree-node__content:hover {
            background-color: unset !important;
        }
    }
}
</style>
