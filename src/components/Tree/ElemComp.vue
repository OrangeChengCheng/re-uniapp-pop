<!--
 * @Author: Lemon C
 * @Date: 2025-07-23 15:15:48
 * @LastEditTime: 2025-12-25 18:15:30
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
            :check-strictly="isShowRvtGroup"
            :highlight-current="true"
            :check-on-click-node="false"
            :check-on-click-leaf="false"
            :expand-on-click-node="false"
            @node-expand="eltree_nodeExpand"
            @node-click="eltree_nodeClick"
            @check="eltree_check">
            <template #default="{ node, data }">
                <div class="node-label text-overflow" :dataNodeId="data.uniqueId">
                    <div v-if="data.isRvtGroup" class="rvt-group-label">
                        <icon-font name="group" size="20px" color="--bimview-rvt-group-color"></icon-font>
                        <div class="group-name text-overflow" :title="data.name">
                            {{ data.name }}
                        </div>
                    </div>
                    <div v-else :title="data.name" class="text-overflow">
                        {{ data.name }}
                    </div>
                </div>
            </template>
        </el-tree>
        <div class="bottom-area" v-if="isOptionVisible">
            <el-checkbox class="checkbox-primary" v-model="isShowRvtGroup"> 按分组组织目录树 </el-checkbox>
        </div>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ElTree } from 'element-plus';
import { ref, onMounted, PropType, watch, nextTick, computed } from 'vue';

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
    resetElemAttr: Function,
});

const ref_eltree = ref<InstanceType<typeof ElTree> | null>(null);
const treeList = ref<any[]>([]);
const defaultProps = {
    children: 'nodes',
    label: 'name',
};
const isShowRvtGroup = ref(false);
const defaultTreeData = ref<any[]>([]);
const rvtGroupTreeData = ref<any[]>([]);

watch(
    () => props.elem_treeList,
    () => {
        data_update();
    }
);

watch(
    () => isShowRvtGroup.value,
    () => {
        eltree_updateShowType(isShowRvtGroup.value);
    }
);

const isOptionVisible = computed(() => {
    if (!treeList.value.length) return false;
    const rootNode = treeList.value[0];
    const formatType = rootNode.formatType;
    let visible = false;
    if (formatType === 1) {
        visible = rootNode?.hasRvtGroup;
    } else {
        const files = rootNode ? rootNode.files : [];
        visible = files.some((el: any) => el.hasRvtGroup);
    }
    return visible;
});

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

// MARK eltree 更新目录树显示数据类型
const eltree_updateShowType = (isShowRvtGroup: boolean) => {
    // 恢复所有数据集的所有构件颜色和透明度
    props.resetElemAttr?.();

    const domRef = ref_eltree.value;
    const rootNode = treeList.value[0];
    let fileNodes = [];
    if (rootNode.formatType === 1) {
        fileNodes = [rootNode];
    } else {
        fileNodes = treeList.value[0].nodes;
    }

    const treeDataMap = isShowRvtGroup ? rvtGroupTreeData.value : defaultTreeData.value;

    // 重置展开状态
    fileNodes.forEach((item: any) => {
        const node: any = domRef?.getNode(item.uniqueId);
        node.expanded = false;
    });

    // 重置高亮状态
    domRef?.setCurrentKey("");

    // 配置数据
    nextTick(() => {
        // 填充子节点数据，将保存的数据进行覆盖
        for (const item of fileNodes) {
            const find = treeDataMap.find((el: any) => el.parentUniqueId === item.uniqueId);
            if (find) {
                item.nodes = find.nodes;
            } else {
                item.nodes = [{ name: '' }];
            }
        }
        // 勾选节点
        let checkedKeys = [];
        if (isShowRvtGroup) {
            checkedKeys = [treeList.value[0].uniqueId];
            const nodeKeys = fileNodes.map((el: any) => el.uniqueId);
            checkedKeys = [...checkedKeys, ...nodeKeys];
        } else {
            checkedKeys = [treeList.value[0].uniqueId];
        }
        nextTick(() => {
            // 必须再次嵌套一个nextTick, 等待上一个dom覆盖数据完成
            domRef?.setCheckedKeys(checkedKeys);
        });
    });
};

// MARK eltree 节点-被展开
const eltree_nodeExpand = (nodeData: any, node: any) => {
    if (isShowRvtGroup.value) {
        const fileNodeData = handle_findFileNode(node);
        if (!fileNodeData.hasRvtGroup) {
            node.expanded = false;
            node.loading = true;
            nodeData.nodes = [];
            node.expanded = true;
            node.loading = false;
            return;
        }
        eltree_nodeExpand_group(nodeData, node);
    } else {
        eltree_nodeExpand_default(nodeData, node);
    }
};

// MARK eltree 节点-被展开-分组数据
const eltree_nodeExpand_group = (nodeData: any, node: any) => {
    const isNodeExpanded = nodeData.nodes[0]?.uniqueId;
    if (isNodeExpanded) {
        if (node.checked) {
            node.childNodes.forEach((item: any) => {
                item.checked = true;
            });
        }
        return;
    }
    service_getTreeSubNodes_group(nodeData, node);
};

// MARK eltree 节点-被展开-默认数据
const eltree_nodeExpand_default = (nodeData: any, node: any) => {
    const isNodeExpanded = nodeData.nodes[0]?.uniqueId;
    if (isNodeExpanded) {
        if (node.checked) {
            node.childNodes.forEach((item: any) => {
                item.checked = true;
            });
        }
        return;
    }

    let enableLazyLoading = nodeData.enableLazyLoading;
    if (enableLazyLoading) {
        service_getTreeSubNodesByLazy_default(nodeData, node);
    } else {
        service_getTreeSubNodes_default(nodeData, node);
    }
};

// MARK eltree 节点-被点击
const eltree_nodeClick = async (nodeData: any, node: any) => {
    if (nodeData.customNodeType === 'dataSet') {
        engine_camToDataSet();
        return;
    }
    if (nodeData.customNodeType === 'file') {
        const elemIds = await service_getElemIds_default(nodeData);
        if (elemIds.length) {
            engine_camToElem(elemIds);
        }
        return;
    }
    if (isShowRvtGroup.value) {
        const elemIds = await service_getElemIds_group(nodeData, node);
        if (elemIds.length) {
            engine_camToElem(elemIds);
        }
    } else {
        const elemIds = await service_getElemIds_default(nodeData);
        if (elemIds.length) {
            engine_camToElem(elemIds);
        }
    }
};

// MARK eltree 节点复选框-被点击
const eltree_check = async (nodeData: any) => {
    const node: any = ref_eltree.value?.getNode(nodeData.uniqueId);

    // 如果操作对象为数据集
    if (nodeData.customNodeType === 'dataSet') {
        const dataSetType = nodeData.dataSetType;
        engine_dataSetVisible(dataSetType, node.checked);

        if (isShowRvtGroup.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
        }
        return;
    }

    // 如果操作对象为文件夹/pak
    if (nodeData.customNodeType === 'file') {
        const elemIds = await service_getElemIds_default(nodeData);
        engine_elemVisible(elemIds, node.checked);

        if (isShowRvtGroup.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
        }
        return;
    }

    if (isShowRvtGroup.value) {
        const elemIds = await service_getElemIds_group(nodeData, node);
        engine_elemVisible(elemIds, node.checked);
        eltree_check_childNodesCheckStatus(nodeData, node.checked);
    } else {
        const elemIds = await service_getElemIds_default(nodeData);
        engine_elemVisible(elemIds, node.checked);
    }
};

// MARK eltree 节点复选框-子节点选择状态
const eltree_check_childNodesCheckStatus = (nodeData: any, checked: boolean) => {
    const childNodeKeys = handle_findAllKeyValues(nodeData, 'uniqueId');
    childNodeKeys.forEach((key: any) => {
        const node: any = ref_eltree.value?.getNode(key);
        if (node) {
            node.checked = checked;
        }
    });
};

// MARK service 获取目录树子节点-默认数据
const service_getTreeSubNodes_default = async (nodeData: any, node: any) => {
    node.expanded = false;
    node.loading = true;

    let params = {
        dataSetId: props.sceneId,
        fileIntId: nodeData.fileIntId,
        uniqueId: nodeData.uniqueId,
    };
    const response = await REService.getSharedProjectTreeSubNodes(params);
    nodeData.nodes = response;
    const find = defaultTreeData.value.find((item: any) => item.uniqueId === nodeData.uniqueId);
    if (!find) {
        let obj = {
            parentUniqueId: nodeData.uniqueId,
            nodes: response,
        };
        defaultTreeData.value.push(obj);
    }
    nextTick(() => {
        if (node.checked) {
            node.childNodes.forEach((item: any) => {
                item.checked = true;
            });
        }
        node.expanded = true;
        node.loading = false;
    });
};

// MARK service 获取目录树子节点-分组数据
const service_getTreeSubNodes_group = async (nodeData: any, node: any) => {
    node.expanded = false;
    node.loading = true;

    let params = {
        dataSetId: props.sceneId,
        fileIntId: nodeData.fileIntId,
        uniqueId: nodeData.uniqueId,
    };
    const response = await REService.getSharedBimElemTreeNodesByGroupService(params);
    nodeData.nodes = response;
    const find = rvtGroupTreeData.value.find((item: any) => item.uniqueId === nodeData.uniqueId);
    if (!find) {
        let obj = {
            parentUniqueId: nodeData.uniqueId,
            nodes: response,
        };
        rvtGroupTreeData.value.push(obj);
    }
    nextTick(() => {
        if (node.checked) {
            node.childNodes.forEach((item: any) => {
                item.checked = true;
            });
        }
        node.expanded = true;
        node.loading = false;
    });
};

// MARK service 获取目录树子节点-懒加载-默认数据
const service_getTreeSubNodesByLazy_default = async (nodeData: any, node: any) => {
    node.expanded = false;
    node.loading = true;

    let params = {
        dataSetId: props.sceneId,
        parentNodeIntId: nodeData.nodeIntId ? Number(nodeData.nodeIntId) : Number(nodeData.fileIntId),
        hostFileId: Number(nodeData.fileIntId),
    };
    const response = await REService.getSharedProjectTreeSubNodesByLazy(params);
    nodeData.nodes = response.map((item: any) => {
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
};

// MARK service 获取构件id-默认数据
const service_getElemIds_default = async (nodeData: any) => {
    if (nodeData.enableLazyLoading) {
        let params = {
            dataSetId: props.sceneId,
            hostFileId: Number(nodeData.fileIntId),
            levelCode: nodeData.levelCode ? nodeData.levelCode : undefined,
        };
        const response = await REService.getSharedProjectTreeChildrenByLazy(params);
        return response;
    } else {
        const params = handle_getRequestParam_default(nodeData);
        const response = await REService.getSharedProjectTreeChildren(params);
        return response[0].childNodeIds;
    }
};

// MARK service 获取构件id-分组数据
const service_getElemIds_group = async (nodeData: any, node: any) => {
    const params = handle_getRequestParam_group(nodeData, node);
    const response = await REService.getSharedBimElemIdsByGroupService(params);
    return response.childNodeIds;
};

// MARK data 查找-所有指定key的数据
const handle_findAllKeyValues = (nodeData: any, key: string) => {
    let keyValueArray: any[] = [];
    const recursionFunc = (item: any) => {
        if (item[key]) {
            keyValueArray.push(item[key]);
        }
        if (item.nodes && item.nodes.length) {
            item.nodes.forEach((node: any) => {
                recursionFunc(node);
            });
        }
    };
    const nodes = nodeData.nodes.length ? nodeData.nodes : [nodeData];
    nodes.forEach((item: any) => {
        recursionFunc(item);
    });

    return keyValueArray;
};

// MARK data 查找-文件节点
const handle_findFileNode = (node: any) => {
    const nodeData = node.data;
    if (nodeData.formatType === 1) return nodeData;
    if (nodeData.customNodeType === 'file') return nodeData;

    if (node.parent) {
        return handle_findFileNode(node.parent);
    }
};

// MARK data 处理数据-获取构件id请求参数-默认数据
const handle_getRequestParam_default = (nodeData: any) => {
    let dataSetId = props.sceneId;
    if (nodeData.customNodeType === 'file') {
        let params = {
            dataSets: [
                {
                    dataSetId: dataSetId,
                    hostFileId: nodeData.fileIntId,
                },
            ],
        };
        return params;
    }

    const childNodeIds = handle_findAllKeyValues(nodeData, 'nodeId');
    let dataSets = childNodeIds.map((item: any) => {
        let obj = {
            dataSetId: dataSetId,
            childNodeId: item,
        };
        return obj;
    });
    let params = { dataSets };
    return params;
};

// MARK data 处理数据-获取构件id请求参数-分组数据
const handle_getRequestParam_group = (nodeData: any, node: any) => {
    const childNodeIds = handle_findAllKeyValues(nodeData, 'nodeId');
    const fileNodeData = handle_findFileNode(node);
    let params = {
        dataSetId: props.sceneId,
        hostFileId: fileNodeData.fileIntId,
        childNodeId: childNodeIds,
    };
    return params;
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
    display: flex;
    flex-direction: column;

    :deep(.eltree-area) {
        position: relative;
        width: 100%;
        flex: 1;
        // max-height: 100%;
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

            .node-label {
                font-size: 14px;
                overflow: hidden;
                color: white;

                .rvt-group-label {
                    display: flex;
                    align-items: center;

                    .iconfont {
                        margin-right: 4px;
                    }

                    .group-name {
                        color: var(--bimview-rvt-group-color) !important;
                    }
                }

                .text-overflow {
                    display: block;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
            }
        }

        .el-tree-node.is-current > .el-tree-node__content {
            background-color: rgba(37, 128, 255, 0.1) !important;
        }

        .el-tree-node__content:hover {
            background-color: unset !important;
        }
    }

    .bottom-area {
        position: relative;
        width: 100%;
        height: 40px;
        display: flex;
        flex-shrink: 1;
        align-items: center;
        padding: 0px 10px;
        box-sizing: border-box;
        border-top: 1px solid #c1c1c1;

        :deep(.el-checkbox) {
            display: flex;
            align-items: center;

            .el-checkbox__label {
                color: white !important;
            }
        }
    }
}
</style>
