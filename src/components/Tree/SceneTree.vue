<!--
 * @Author: Lemon C
 * @Date: 2025-07-18 11:30:35
 * @LastEditTime: 2025-07-24 14:39:20
-->
<!--
 * @Author: Lemon C
 * @Date: 2025-07-18 11:30:35
 * @LastEditTime: 2025-07-23 09:38:21
-->
<template>
    <div class="sup-scene-tree">
        <el-tree
            class="eltree-area"
            ref="ref_eltree"
            :data="treeList"
            :props="defaultProps"
            node-key="nodeId"
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
import { ref, onMounted, nextTick } from 'vue';

const REService = (window as any).$service;

const props = defineProps({
    sceneId: String,
    camToWater: Function,
    camToExtrude: Function,
    camToElem: Function,
    camToDataSet: Function,
    waterVisible: Function,
    extrudeVisible: Function,
    dataSetVisible: Function,
    elemVisible: Function,
});

const ref_eltree = ref<InstanceType<typeof ElTree> | null>(null);
const treeList = ref<any[]>([]);
const defaultProps = {
    children: 'subNodes',
    label: 'nodeName',
};

onMounted(() => {
    service_getProjectSceneTree();
});

// MARK service 获取目录树-场景
const service_getProjectSceneTree = () => {
    let sceneId = props.sceneId;
    let params = { sceneId, isPublished: true };
    REService.getSharedProjectSceneTree(params).then((res: any) => {
        treeList.value = handle_formatSceneTree(res);
        eltree_initStyle();
    });
};

// MARK service 获取目录树-数据集
const service_getProjectTree = (nodeData: any, node: any) => {
    let dataSetId = nodeData.dataSetId;
    let params = { dataSetId };

    REService.getSharedProjectTree(params).then((res: any) => {
        let treeData = handle_formatDataSetTree(res);
        nodeData.subNodes = treeData;

        eltree_updataNode(node);
    });
};

// MARK service 获取目录树字节点
const service_getTreeSubNodes = (nodeData: any, node: any) => {
    let params = {
        dataSetId: nodeData.dataSetId,
        fileIntId: nodeData.fileIntId,
        uniqueId: nodeData.uniqueId,
    };
    REService.getSharedProjectTreeSubNodes(params).then((res: any) => {
        let data = res;
        data = handle_formatPakChildNodeData(data, nodeData.dataSetId);
        nodeData.subNodes = data;

        eltree_updataNode(node);
    });
};

// MARK service 获取目录树字节点-懒加载
const service_getTreeSubNodesByLazy = (nodeData: any, node: any) => {
    let params = {
        dataSetId: nodeData.dataSetId,
        parentNodeIntId: nodeData.nodeIntId ? Number(nodeData.nodeIntId) : Number(nodeData.fileUniqueId),
        hostFileId: Number(nodeData.fileUniqueId),
    };
    REService.getSharedProjectTreeSubNodesByLazy(params).then((res: any) => {
        let data = res;
        data = handle_formatPakChildNodeData(data, nodeData.dataSetId);
        nodeData.subNodes = res.map((item: any) => {
            item['fileUniqueId'] = nodeData.fileUniqueId;
            item['enableLazyLoading'] = true;
            item.subNodes = [{ nodeName: '' }];
            return item;
        });

        eltree_updataNode(node);
    });
};

// MARK data 格式化-场景树
const handle_formatSceneTree = (list: any) => {
    if (!list) return [];
    let sceneData = list;
    let rootFolders = handle_findAllNodeByLevel(sceneData, 3);
    let folders = handle_findAllNodeByLevel(sceneData, 1);
    let allFolders = [...rootFolders, ...folders];
    allFolders.forEach((item) => {
        let rootNodeId = item.levelCode.split('/')[0];
        let find = rootFolders.find((el: any) => el.sceneNodeId === rootNodeId);
        item.dataSetType = find.dataSetType;
        item.srcDataSetType = find.srcDataSetType;
        item['nodeName'] = item.sceneNodeName;
        item['nodeId'] = item.sceneNodeId;
    });

    let allDatasets = handle_findAllNodeByLevel(sceneData, 2);
    allDatasets.forEach((item: any) => {
        item['customNodeType'] = 'dataSet';
        item['nodeId'] = item.sceneNodeId;
        let findLastIndex = item.sceneNodeName.lastIndexOf('.');
        if (findLastIndex !== -1) {
            item['nodeName'] = item.sceneNodeName.substring(0, findLastIndex);
            item['sceneNodeName'] = item.nodeName;
        } else {
            item['nodeName'] = item.sceneNodeName;
        }

        if (item.viewStatus === 2) {
            item['disabled'] = true;
        }

        if (item.dataSetType === 0 && item.viewStatus !== 2) {
            item.subNodes.push({ nodeName: '' });
        }

        if (item.dataSetType === 19) {
            let componentInfo = item.componentInfo;
            componentInfo.id = componentInfo.treeNodeId;
            let { hostFileId, instanceIndex, isPublished } = componentInfo;
            if (isPublished) {
                componentInfo.dataSetId = item.parentId;
                componentInfo.elemId = Number(`${hostFileId}${instanceIndex}`);
            }
        }

        // 水面类型，将waterId提升一级，方便调用
        if (item.dataSetType === 23) {
            let waterInfo = item.waterInfo;
            item.waterId = waterInfo.id;
        }

        // 开挖类型，将extrudeId提升一级，方便调用
        if (item.dataSetType === 24) {
            let extrudeInfo = item.excavateInfo;
            item.extrudeId = extrudeInfo.id;
        }
    });

    return sceneData;
};

// MARK data 格式化-数据集树
const handle_formatDataSetTree = (dataSetList: any) => {
    let formatType = dataSetList[0] && dataSetList[0].formatType;
    if (formatType === 1) {
        let treeData = dataSetList[0].files;
        treeData.forEach((item: any) => {
            item['customNodeType'] = 'pakModel';
            item['nodeName'] = item.fileName;
            item['fileUniqueId'] = item.fileIntId;
            item['nodeId'] = `${dataSetList[0].dataSetId}-${item.uniqueId}`;
            item['dataSetId'] = dataSetList[0].dataSetId;
            item.subNodes = [{ nodeName: '' }];
        });
        return treeData;
    } else {
        dataSetList.forEach((item: any) => {
            item.subNodes = item.files;
            item.subNodes.forEach((node: any) => {
                node['customNodeType'] = 'pakModel';
                node['nodeName'] = node.fileName;
                node['fileUniqueId'] = node.fileIntId;
                node['nodeId'] = `${item.dataSetId}-${node.uniqueId}`;
                node['dataSetId'] = item.dataSetId;
                node.subNodes = [{ nodeName: '' }];
            });
        });
        let treeData = dataSetList[0].subNodes;
        return treeData;
    }
};

// MARK data 格式化-数据集子节点
const handle_formatPakChildNodeData = (treeData: any, dataSetId: string) => {
    for (let node of treeData) {
        node['childNodeId'] = node.nodeId;
        node['nodeId'] = `${dataSetId}-${node.uniqueId ? node.uniqueId : node.levelCode}`;
        node['nodeName'] = node.name ? node.name : node.nodeName;
        node['subNodes'] = node.nodes;
        node['customNodeType'] = 'pakChildNode';
        node['dataSetId'] = dataSetId;
        if (node.nodes && node.nodes.length) {
            handle_formatPakChildNodeData(node.nodes, dataSetId);
        }
    }
    return treeData;
};

// MARK data 判断-单构件数据
const handle_isEntityNode = (nodeData: any) => {
    let allData = handle_findAllNodeByLevel([nodeData], 2);
    let isEntityNode = allData.every((el: any) => el.dataSetType === 19);
    return isEntityNode;
};

// MARK data 判断-水面数据
const handle_isWaterNode = (nodeData: any) => {
    let dataSetType = nodeData.dataSetType;
    return dataSetType === 23;
};

// MARK data 判断-挤出数据
const handle_isExtrudeNode = (nodeData: any) => {
    let dataSetType = nodeData.dataSetType;
    return dataSetType === 24;
};

// MARK data 查找-所有key
const handle_findAllKeys = (treeData: any, array: any) => {
    for (let item of treeData) {
        if (item.childNodeId) {
            array.push(item.childNodeId);
        }
        if (item.nodes && item.nodes.length) {
            handle_findAllKeys(item.nodes, array);
        }
    }
    return array;
};

// MARK data 查找-节点级别数据
const handle_findAllNodeByLevel = (list: any, level: number) => {
    const array: any = [];

    const traverse = (item: any) => {
        if (item.nodeType && item.nodeType === level) {
            array.push(item);
        }
        if (item.subNodes && item.subNodes.length) {
            item.subNodes.forEach((subNode: any) => {
                traverse(subNode);
            });
        }
    };

    list.forEach((item: any) => {
        traverse(item);
    });

    return array;
};

// MARK data 处理数据-获取数据集
const handle_getDataSetList = (nodeData: any) => {
    let dataSets: any = [];
    [nodeData].forEach((item: any) => {
        if (item.fileIntId) {
            dataSets.push({
                dataSetId: nodeData.dataSetId,
                hostFileId: item.fileIntId,
            });
        }
        if (item.nodeId) {
            let tempArray: any = [];
            if (item.subNodes.length) {
                handle_findAllKeys(item.subNodes, tempArray);
            } else {
                handle_findAllKeys([item], tempArray);
            }
            tempArray = tempArray.map((el: any) => {
                let obj = {
                    dataSetId: nodeData.dataSetId,
                    childNodeId: el,
                };
                return obj;
            });
            dataSets = [...dataSets, ...tempArray];
        }
    });
    return dataSets;
};

// MARK data 处理数据-获取视图切换数据集
const handle_getgetToggleViewDataSetList = (allDatasets: any) => {
    let dataSets = allDatasets.map((item: any) => {
        let obj: any = {
            dataSetType: item.dataSetType,
        };
        if (item.dataSetType === 19) {
            let componentInfo = item.componentInfo;
            obj.dataSetId = componentInfo.dataSetId;
            // obj.dataSetId = componentInfo.dataSetId.replace(/-/g, '');
            obj.elemId = componentInfo.elemId;
        } else {
            // obj.dataSetId = item.dataSetId.replace(/-/g, '');
            obj.dataSetId = item.dataSetId;
        }
        return obj;
    });
    return dataSets;
};

// MARK eltree 节点被展开
const eltree_nodeExpand = (nodeData: any, node: any, el: any) => {
    if (!nodeData.customNodeType) return;
    if (nodeData.subNodes && nodeData.subNodes[0].uniqueId) {
        if (node.checked) {
            node.childNodes.forEach((item: any) => {
                item.checked = true;
            });
        }
        return;
    }

    let customNodeType = nodeData.customNodeType;
    node.expanded = false;
    node.loading = true;

    if (customNodeType === 'dataSet') {
        service_getProjectTree(nodeData, node);
    }

    if (customNodeType === 'pakModel' || customNodeType === 'pakChildNode') {
        let enableLazyLoading = nodeData.enableLazyLoading;
        if (enableLazyLoading) {
            service_getTreeSubNodesByLazy(nodeData, node);
        } else {
            service_getTreeSubNodes(nodeData, node);
        }
    }
};

// MARK eltree 节点被点击
const eltree_nodeClick = (nodeData: any, node: any) => {
    if (handle_isWaterNode(nodeData)) {
        engine_camToWater(nodeData);
        return;
    }
    if (handle_isExtrudeNode(nodeData)) {
        engine_camToExtrude(nodeData);
        return;
    }
    if (!nodeData.customNodeType) {
        let allDataSets = handle_findAllNodeByLevel([nodeData], 2);
        if (handle_isEntityNode(nodeData)) {
            engine_camToEntity(allDataSets);
        } else {
            engine_camToDataSet(allDataSets);
        }
        return;
    }
    if (nodeData.customNodeType === 'dataSet') {
        if (nodeData.dataSetType === 19) {
            engine_camToEntity([nodeData]);
        } else {
            engine_camToDataSet([nodeData]);
        }
        return;
    }
    if (nodeData.enableLazyLoading) {
        let params = {
            dataSetId: nodeData.dataSetId,
            hostFileId: Number(nodeData.fileUniqueId),
            levelCode: nodeData.levelCode ? nodeData.levelCode : undefined,
        };
        REService.getSharedProjectTreeChildrenByLazy(params).then((res: any) => {
            let childNodeIds = res.map((el: any) => el.elemIntId);
            if (childNodeIds.length) {
                let dataSetId = nodeData.dataSetId;
                // let dataSetId = nodeData.dataSetId.replace(/-/g, '');
                let dataSets = [{ dataSetId, elemIds: childNodeIds }];
                engine_camToElem(dataSets);
            }
        });
    } else {
        let dataSets = handle_getDataSetList(nodeData);
        let params = { dataSets };
        REService.getSharedProjectTreeChildren(params).then((res: any) => {
            let childNodeIds = res[0].childNodeIds;
            if (childNodeIds.length) {
                let dataSetId = nodeData.dataSetId;
                // let dataSetId = nodeData.dataSetId.replace(/-/g, '');
                let dataSets = [{ dataSetId, elemIds: childNodeIds }];
                engine_camToElem(dataSets);
            }
        });
    }
};

// MARK eltree 节点复选框被点击
const eltree_check = (nodeData: any) => {
    let domRef: any = ref_eltree.value;
    let nodeObject = domRef.getNode(nodeData);
    if (handle_isWaterNode(nodeData)) {
        let leafNodes = handle_findAllNodeByLevel([nodeData], 2);
        engine_waterVisible(leafNodes, nodeObject.checked);
        return;
    }
    if (handle_isExtrudeNode(nodeData)) {
        let leafNodes = handle_findAllNodeByLevel([nodeData], 2);
        engine_extrudeVisible(leafNodes, nodeObject.checked);
        return;
    }
    if (!nodeData.customNodeType) {
        let allDatasets = handle_findAllNodeByLevel(nodeData.subNodes, 2);
        let dataSets = handle_getgetToggleViewDataSetList(allDatasets);
        props.dataSetVisible?.(dataSets, nodeObject.checked);
        return;
    }
    if (nodeData.customNodeType === 'dataSet') {
        let dataSets = handle_getgetToggleViewDataSetList([nodeData]);
        props.dataSetVisible?.(dataSets, nodeObject.checked);
        return;
    }
    if (nodeData.customNodeType === 'pakModel') {
        if (nodeData.enableLazyLoading) {
            let params = {
                dataSetId: nodeData.dataSetId,
                hostFileId: Number(nodeData.fileUniqueId),
                levelCode: nodeData.levelCode ? nodeData.levelCode : undefined,
            };
            REService.getSharedProjectTreeChildrenByLazy(params).then((res: any) => {
                let childNodeIds = res.map((el: any) => el.elemIntId);
                if (childNodeIds.length) {
                    let dataSetId = nodeData.dataSetId;
                    // let dataSetId = nodeData.dataSetId.replace(/-/g, '');
                    props.elemVisible?.(dataSetId, childNodeIds, nodeObject.checked);
                }
            });
        } else {
            let dataSets = [];
            dataSets.push({
                dataSetId: nodeData.dataSetId,
                hostFileId: nodeData.fileIntId,
            });
            let params = { dataSets };
            REService.getSharedProjectTreeChildren(params).then((res: any) => {
                let childNodeIds = res[0].childNodeIds;
                if (childNodeIds.length) {
                    let dataSetId = nodeData.dataSetId;
                    // let dataSetId = nodeData.dataSetId.replace(/-/g, '');
                    props.elemVisible?.(dataSetId, childNodeIds, nodeObject.checked);
                }
            });
        }
    }
    if (nodeData.customNodeType === 'pakChildNode') {
        if (nodeData.enableLazyLoading) {
            let params = {
                dataSetId: nodeData.dataSetId,
                hostFileId: Number(nodeData.fileUniqueId),
                levelCode: nodeData.levelCode ? nodeData.levelCode : undefined,
            };
            REService.getSharedProjectTreeChildrenByLazy(params).then((res: any) => {
                let childNodeIds = res.map((el: any) => el.elemIntId);
                if (childNodeIds.length) {
                    let dataSetId = nodeData.dataSetId;
                    // let dataSetId = nodeData.dataSetId.replace(/-/g, '');
                    props.elemVisible?.(dataSetId, childNodeIds, nodeObject.checked);
                }
            });
        } else {
            let dataSets = [];
            dataSets.push({
                dataSetId: nodeData.dataSetId,
                childNodeId: nodeData.childNodeId,
            });
            let tempArray: any = [];
            if (nodeData.subNodes.length) {
                handle_findAllKeys(nodeData.subNodes, tempArray);
            }
            tempArray = tempArray.map((el: any) => {
                let obj = {
                    dataSetId: nodeData.dataSetId,
                    childNodeId: el,
                };
                return obj;
            });
            dataSets = [...dataSets, ...tempArray];
            let params = { dataSets };
            REService.getSharedProjectTreeChildren(params).then((res: any) => {
                let childNodeIds = res[0].childNodeIds;
                if (childNodeIds.length) {
                    let dataSetId = nodeData.dataSetId;
                    // let dataSetId = nodeData.dataSetId.replace(/-/g, '');
                    props.elemVisible?.(dataSetId, childNodeIds, nodeObject.checked);
                }
            });
        }
    }
};

// MARK eltree 更新节点-展开&选中&关闭loading
const eltree_updataNode = (node: any) => {
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

// MARK eltree 初始化样式
const eltree_initStyle = () => {
    let allRootNodes = handle_findAllNodeByLevel(treeList.value, 3);
    let allFolders = handle_findAllNodeByLevel(treeList.value, 1);
    let allDatasets = handle_findAllNodeByLevel(treeList.value, 2);

    nextTick(() => {
        let domRef: any = ref_eltree.value;

        allRootNodes.forEach((item: any) => {
            let node = domRef.getNode(item.nodeId);
            node.expanded = true;
            node.checked = true;
        });

        allFolders.forEach((item: any) => {
            let node = domRef.getNode(item.nodeId);
            node.checked = true;
        });

        allDatasets.forEach((item: any) => {
            let node = domRef.getNode(item.nodeId);
            node.checked = true;
        });
    });
};

// MARK Engine 定位水面
const engine_camToWater = (nodeData: any) => {
    let waterList = handle_findAllNodeByLevel([nodeData], 2);
    let waterIds = waterList.map((item: any) => item.waterId);
    props.camToWater?.(waterIds);
};

// MARK Engine 定位挤出
const engine_camToExtrude = (nodeData: any) => {
    let extrudeList = handle_findAllNodeByLevel([nodeData], 2);
    let extrudeIds = extrudeList.map((item: any) => item.extrudeId);
    props.camToExtrude?.(extrudeIds);
};

// MARK Engine 定位单构件
const engine_camToEntity = (allDataSets: any) => {
    let dataSets: any = [];
    allDataSets.forEach((item: any) => {
        let componentInfo = item.componentInfo;
        let find = dataSets.find((el: any) => el.dataSetId === componentInfo.dataSetId);
        if (find) {
            find.elemIds.push(componentInfo.elemId);
        } else {
            let obj = {
                dataSetId: componentInfo.dataSetId,
                elemIds: [componentInfo.elemId],
            };
            dataSets.push(obj);
        }
    });

    dataSets.forEach((item: any) => {
        item.dataSetId = item.dataSetId;
        // item.dataSetId = item.dataSetId.replace(/-/g, '');
    });
    engine_camToElem(dataSets);
};

// MARK Engine 定位数据集
const engine_camToDataSet = (allDataSets: any) => {
    allDataSets = allDataSets.filter((el: any) => el.viewStatus !== 2);
    if (!allDataSets.length) {
        return;
    }

    let dataSets = allDataSets.map((item: any) => {
        let dataSetId = item.dataSetId;
        let dataSetType = item.dataSetType;
        let obj = { dataSetId, dataSetType };
        return obj;
    });

    const terrainType = [10, 13, 21, 22];
    let locType = 'CAM_DIR_DEFAULT';
    if (dataSets.length === 1) {
        let dataSetInfo = dataSets[0];
        if (terrainType.includes(dataSetInfo.dataSetType)) {
            locType = 'CAM_DIR_TOP';
        } else {
            locType = 'CAM_DIR_TOPRIGHTBACK';
        }
    } else {
        let isIncludesTerrainType = dataSets.some((el: any) => terrainType.includes(el.dataSetType));
        if (isIncludesTerrainType) {
            locType = 'CAM_DIR_TOP';
        } else {
            locType = 'CAM_DIR_TOPRIGHTBACK';
        }
    }

    props.camToDataSet?.(dataSets, locType);
};

// MARK Engine 定位构件
const engine_camToElem = (dataSetList: any) => {
    let locIDList: any = [];
    dataSetList.forEach((item: any) => {
        let obj = {
            dataSetId: item.dataSetId,
            elemIdList: item.elemIds,
        };
        locIDList.push(obj);
    });
    props.camToElem?.(locIDList, 'CAM_DIR_TOPRIGHTBACK', true);
};

// MARK Engine 水面显示隐藏
const engine_waterVisible = (waterList: any, visible: boolean) => {
    let waterIds = waterList.map((item: any) => item.waterId);
    props.waterVisible?.(waterIds, visible);
};

// MARK Engine 挤出显示隐藏
const engine_extrudeVisible = (extrudeList: any, visible: boolean) => {
    let extrudeIds = extrudeList.map((item: any) => item.extrudeId);
    props.extrudeVisible?.(extrudeIds, visible);
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-scene-tree {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: auto;

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
