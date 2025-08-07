<!--
 * @Author: Lemon C
 * @Date: 2025-07-23 15:15:48
 * @LastEditTime: 2025-08-06 16:02:35
-->
<template>
    <div class="sup-elem-comp">
        <el-tree
            class="eltree-area"
            ref="ref_eltree"
            :data="treeList"
            :props="defaultProps"
            node-key="uniqueId"
            show-checkbox
            :highlight-current="true"
            :check-on-click-node="false"
            :check-on-click-leaf="false"
            :expand-on-click-node="false"
            @node-expand="eltree_nodeExpand"
            @node-click="eltree_nodeClick"
            @check="eltree_check" />
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ElTree } from 'element-plus';
import { ref, onMounted, PropType, watch, nextTick } from 'vue';

const REService = (window as any).$service;

const props = defineProps({
    sceneId: String,
    elem_treeList: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    camToElem: Function,
    camToDataSet: Function,
    dataSetVisible: Function,
    elemVisible: Function,
});

const ref_eltree = ref<InstanceType<typeof ElTree> | null>(null);
const treeList = ref<any[]>([]);
const defaultProps = {
    children: 'nodes',
    label: 'name',
};



watch(
    () => props.elem_treeList,
    () => {
        data_update();
    }
);

onMounted(() => {
    data_update();
});

// MARK data 接收数据
const data_update = () => {
    if (!props.elem_treeList.length) return;
    treeList.value = props.elem_treeList;
    nextTick(() => {
        let selTreeData: any = treeList.value[0];
        nextTick(() => {
            ref_eltree.value?.setCheckedKeys([selTreeData.uniqueId]);
        });
    });
};

// MARK service 获取目录树字节点
const service_getTreeSubNodes = (nodeData: any, node: any) => {
    let params = {
        dataSetId: props.sceneId,
        fileIntId: nodeData.fileIntId,
        uniqueId: nodeData.uniqueId,
    };
    REService.getSharedProjectTreeSubNodes(params).then((res: any) => {
        nodeData.nodes = res;
        nextTick(() => {
            if (node.checked) {
                node.childNodes.forEach((item: any) => {
                    item.checked = true;
                });
            }
            node.expanded = true;
            node.loading = false;
        });
    });
};

// MARK service 获取目录树字节点-懒加载
const service_getTreeSubNodesByLazy = (nodeData: any, node: any) => {
    let params = {
        dataSetId: props.sceneId,
        parentNodeIntId: nodeData.nodeIntId ? Number(nodeData.nodeIntId) : Number(nodeData.fileIntId),
        hostFileId: Number(nodeData.fileIntId),
    };
    REService.getSharedProjectTreeSubNodesByLazy(params).then((res: any) => {
        nodeData.nodes = res.map((item: any) => {
            item['fileIntId'] = nodeData.fileIntId;
            item['uniqueId'] = item.levelCode;
            item['name'] = item.nodeName;
            item['enableLazyLoading'] = true;
            item.nodes = [{ name: '' }];
            return item;
        });

        nextTick(() => {
            if (node.checked) {
                node.childNodes.forEach((item: any) => {
                    item.checked = true;
                });
            }

            node.expanded = true;
            node.loading = false;
        });
    });
};

// MARK data 查找-所有key
const handle_findAllKeys = (treeData: any, array: any) => {
    for (let item of treeData) {
        if (item.nodeId) {
            array.push(item.nodeId);
        }
        if (item.nodes && item.nodes.length) {
            handle_findAllKeys(item.nodes, array);
        }
    }
    return array;
};

// MARK data 处理数据-获取数据集
const handle_getDataSetList = (nodeData: any) => {
    let dataSetId = props.sceneId;
    let dataSets: any = [];
    [nodeData].forEach((item: any) => {
        if (item.fileIntId) {
            dataSets.push({
                dataSetId,
                hostFileId: item.fileIntId,
            });
        }
        if (item.nodeId) {
            let tempArray: any = [];
            if (item.nodes.length) {
                handle_findAllKeys(item.nodes, tempArray);
            } else {
                handle_findAllKeys([item], tempArray);
            }
            tempArray = tempArray.map((el: any) => {
                let obj = {
                    dataSetId,
                    childNodeId: el,
                };
                return obj;
            });
            dataSets = [...dataSets, ...tempArray];
        }
    });
    return dataSets;
};

// MARK eltree 节点被展开
const eltree_nodeExpand = (nodeData: any, node: any, el: any) => {
    if (nodeData.nodes[0].uniqueId) {
        if (node.checked) {
            node.childNodes.forEach((item: any) => {
                item.checked = true;
            });
        }
        return;
    }

    node.expanded = false;
    node.loading = true;
    let enableLazyLoading = nodeData.enableLazyLoading;
    if (enableLazyLoading) {
        service_getTreeSubNodesByLazy(nodeData, node);
    } else {
        service_getTreeSubNodes(nodeData, node);
    }
};

// MARK eltree 节点被点击
const eltree_nodeClick = (nodeData: any, node: any) => {
    if (nodeData.customNodeType === 'dataSet') {
        engine_camToDataSet();
        return;
    }
    if (nodeData.enableLazyLoading) {
        let params = {
            dataSetId: props.sceneId,
            hostFileId: Number(nodeData.fileIntId),
            levelCode: nodeData.levelCode ? nodeData.levelCode : undefined,
        };
        REService.getSharedProjectTreeChildrenByLazy(params).then((res: any) => {
            if (res.length) {
                engine_camToElem(res);
            }
        });
    } else {
        let dataSets = handle_getDataSetList(nodeData);
        let params = { dataSets };
        REService.getSharedProjectTreeChildren(params).then((res: any) => {
            let childNodeIds = res[0].childNodeIds;
            if (childNodeIds.length) {
                engine_camToElem(childNodeIds);
            }
        });
    }
};

// MARK eltree 节点复选框被点击
const eltree_check = (nodeData: any) => {
    let domRef: any = ref_eltree.value;
    let nodeObject = domRef.getNode(nodeData);

    // 如果操作对象为数据集
    if (nodeData.customNodeType === 'dataSet') {
        let dataType = nodeData.dataSetType;
        engine_dataSetVisible(dataType, nodeObject.checked);
        return;
    }

    let resourceId = props.sceneId;
    // 如果操作对象为pak
    if (nodeData.customNodeType === 'file') {
        if (nodeData.enableLazyLoading) {
            let params = {
                dataSetId: resourceId,
                hostFileId: Number(nodeData.fileIntId),
                levelCode: nodeData.levelCode ? nodeData.levelCode : undefined,
            };
            REService.getSharedProjectTreeChildrenByLazy(params).then((res: any) => {
                if (res.length) {
                    engine_elemVisible(res, nodeObject.checked);
                }
            });
        } else {
            let dataSets = [];
            dataSets.push({
                dataSetId: resourceId,
                hostFileId: nodeData.fileIntId,
            });
            let params = { dataSets };
            REService.getSharedProjectTreeChildren(params).then((res: any) => {
                let childNodeIds = res[0].childNodeIds;
                if (childNodeIds.length) {
                    engine_elemVisible(childNodeIds, nodeObject.checked);
                }
            });
        }
        return;
    }

    // 如果操作对象为pak子节点
    if (nodeData.enableLazyLoading) {
        let params = {
            dataSetId: resourceId,
            hostFileId: Number(nodeData.fileIntId),
            levelCode: nodeData.levelCode ? nodeData.levelCode : undefined,
        };
        REService.getSharedProjectTreeChildrenByLazy(params).then((res: any) => {
            if (res.length) {
                engine_elemVisible(res, nodeObject.checked);
            }
        });
    } else {
        let dataSets = [];
        dataSets.push({
            dataSetId: resourceId,
            childNodeId: nodeData.nodeId,
        });
        let tempArray: any = [];
        if (nodeData.nodes.length) {
            handle_findAllKeys(nodeData.nodes, tempArray);
        }
        tempArray = tempArray.map((el: any) => {
            let obj = {
                dataSetId: resourceId,
                childNodeId: el,
            };
            return obj;
        });
        dataSets = [...dataSets, ...tempArray];
        let params = { dataSets };
        REService.getSharedProjectTreeChildren(params).then((res: any) => {
            let childNodeIds = res[0].childNodeIds;
            if (childNodeIds.length) {
                engine_elemVisible(childNodeIds, nodeObject.checked);
            }
        });
    }
};

// MARK Engine 定位数据集
const engine_camToDataSet = () => {
    props.camToDataSet?.([{ dataSetId: props.sceneId }], 'CAM_DIR_CURRENT');
};

// MARK Engine 定位构件
const engine_camToElem = (elemIdList: any) => {
    let locIDList: any = [
        {
            dataSetId: props.sceneId,
            elemIdList: elemIdList,
        },
    ];
    props.camToElem?.(locIDList, 'CAM_DIR_CURRENT', true);
};

// MARK Engine 数据集显隐
const engine_dataSetVisible = (dataSetType: any, visible: boolean) => {
    const obj = [{ dataSetId: props.sceneId, dataSetType: dataSetType }];
    props.dataSetVisible?.(obj, visible);
};

// MARK Engine 构件显隐
const engine_elemVisible = (elemIdList: any, visible: boolean) => {
    props.elemVisible?.(props.sceneId, elemIdList, visible);
};


// MARK 暴露方法给父组件
defineExpose({
    ref_eltree,
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-elem-comp {
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
