<template>
    <div class="sup-scene-tree">
        <el-tree
            class="eltree-area"
            ref="ref_eltree"
            :data="treeList"
            :props="defaultProps"
            node-key="nodeId"
            show-checkbox
            :check-strictly="isRvtGroupMode"
            :highlight-current="true"
            :check-on-click-node="false"
            :check-on-click-leaf="false"
            :expand-on-click-node="false"
            @node-expand="eltree_nodeExpand"
            @node-click="eltree_nodeClick"
            @check="eltree_check">
            <template #default="{ node, data }">
                <div :class="computed_nodeClass(data)">
                    <div :class="computed_nodeLabelClass(data)">
                        <div class="icon-box" v-if="data.nodeType && data.nodeType !== 2">
                            <icon-font :name="computed_nodeIconId(data)" size="14px"></icon-font>
                        </div>
                        <div class="label-box">
                            <div v-if="data.isRvtGroup" class="rvt-group-label">
                                <icon-font name="group" size="20px" color="--bimview-rvt-group-color"></icon-font>
                                <div class="group-name text-overflow" :title="data.nodeName">
                                    {{ data.nodeName }}
                                </div>
                            </div>
                            <div v-else :title="data.nodeName" class="group-name text-overflow">
                                {{ data.nodeName }}
                            </div>
                        </div>
                    </div>
                    <!-- <div class="custom-button-box">
                        <div class="button-item-box" v-if="data.nodeType === 3 && data.hasRvtGroup" @click.stop="eltree_updateShowType">
                            <div class="btn-icon-box">
                                <icon-font name="icon-biaogao" size="14px" :class="`${isRvtGroupMode ? '' : 'active'}`"></icon-font>
                                <icon-font name="icon-fenzu" size="14px" :class="`${isRvtGroupMode ? 'active' : ''}`"></icon-font>
                            </div>
                        </div>
                    </div> -->
                </div>
            </template>
        </el-tree>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ElTree } from 'element-plus';
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useStateStore } from '@/stores/state';

const state_store = useStateStore();
const REService = (window as any).$service;

const props = defineProps({
    sceneId: String,
    camToWater: Function,
    camToExtrude: Function,
    camToMonomer: Function,
    camToElem: Function,
    camToDataSet: Function,
    waterVisible: Function,
    extrudeVisible: Function,
    monomerVisible: Function,
    dataSetVisible: Function,
    elemVisible: Function,
    updateTreeData: Function,
});

const ref_eltree = ref<InstanceType<typeof ElTree> | null>(null);
const treeList = ref<any[]>([]);
const defaultProps = {
    children: 'subNodes',
    label: 'nodeName',
};
const isRvtGroupMode = ref(false);
const defaultTreeData = ref<any[]>([]);
const rvtGroupTreeData = ref<any[]>([]);
const sceneInfo = ref<any>({});
const MONOMER_ROOM_ALPHA = 128;

const computed_nodeClass = computed(() => (nodeData: any) => {
    let className = 'custom-node-box';
    if (nodeData.disabled) {
        className += ' node-disabled';
    }
    return className;
});

const computed_nodeLabelClass = computed(() => (nodeData: any) => {
    let nodeType = nodeData.nodeType;
    let className = 'node-label-box';
    if (nodeType === 3) {
        className += ' node-label-bold';
    }
    return className;
});

const computed_nodeIconId = computed(() => (nodeData: any) => {
    let nodeType = nodeData.nodeType;
    if (nodeType === 1) return 'ic-ico_folder';

    let dataSetType = nodeData.dataSetType;
    switch (dataSetType) {
        case 0:
            return 'ic-moxing';
        case 13:
            return 'ic-yg';
        case 10:
            return 'ic-WMTS';
        case 11:
            return 'ic-qxsy';
        case 15:
            return 'ic-dy';
        case 17:
            return 'ic-yuanjian';
        case 18:
            return 'ic-yuanjian';
        case 19:
            return 'ic-yuanjian';
        case 21:
            return 'ic-CADwapian';
        case 22:
            return 'ic-shiliangwapian-2';
        case 23:
            return 'ic-shuimian';
        case 24:
            return 'ic-kaiwa';
        case 25:
            return 'icon-dantihua';
    }
});

watch(
    () => treeList.value,
    () => {
        props.updateTreeData?.(treeList.value);
    },
    {
        deep: true,
    }
);

onMounted(() => {
    service_getSharedSceneInfo();
});

// MARK service 获取场景信息
const service_getSharedSceneInfo = () => {
    REService.getSharedSceneById(props.sceneId).then((res: any) => {
        sceneInfo.value = res;
        if (ref != null) {
            service_getProjectSceneTree();
        }
    });
};

// MARK service 获取目录树-场景
const service_getProjectSceneTree = () => {
    let sceneId = props.sceneId;
    let params = { sceneId, isPublished: true };
    REService.getSharedProjectSceneTree(params).then((res: any) => {
        treeList.value = handle_formatSceneTree(res);
        eltree_initStyle();
    });
};

// MARK service 获取目录树子节点-默认数据
const service_getTreeSubNodes_default = async (nodeData: any, node: any) => {
    node.expanded = false;
    node.loading = true;

    if (nodeData.fileIntId) {
        let params = {
            dataSetId: nodeData.dataSetId,
            fileIntId: nodeData.fileIntId,
            uniqueId: nodeData.uniqueId,
        };
        const response = await REService.getSharedProjectTreeSubNodes(params);
        const subNodes = handle_formatPakChildNode(nodeData, response);
        nodeData.subNodes = subNodes;

        const find = defaultTreeData.value.find((item: any) => item.uniqueId === nodeData.uniqueId);
        if (!find) {
            let obj = {
                parentNodeId: nodeData.nodeId,
                subNodes: subNodes,
            };
            defaultTreeData.value.push(obj);
        }
    } else {
        let dataSetId = nodeData.dataSetId;
        let params = { dataSetId };
        const response = await REService.getSharedProjectTree(params);
        const subNodes = handle_formatDataSetSubNodes(nodeData, response);
        nodeData.subNodes = subNodes;
    }

    // 获取完数据，结束加载和处理勾选数据
    eltree_updataNode(node);
};

// MARK service 获取目录树子节点-分组数据
const service_getTreeSubNodes_group = async (nodeData: any, node: any) => {
    node.expanded = false;
    node.loading = true;

    let params = {
        dataSetId: nodeData.dataSetId,
        fileIntId: nodeData.fileIntId,
        uniqueId: nodeData.uniqueId,
    };
    const response = await REService.getSharedBimElemTreeNodesByGroupService(params);
    const subNodes = handle_formatPakChildNode(nodeData, response);
    nodeData.subNodes = subNodes;

    const find = rvtGroupTreeData.value.find((item: any) => item.uniqueId === nodeData.uniqueId);
    if (!find) {
        let obj = {
            parentNodeId: nodeData.nodeId,
            subNodes: subNodes,
        };
        rvtGroupTreeData.value.push(obj);
    }

    // 获取完数据，结束加载和处理勾选数据
    eltree_updataNode(node);
};

// MARK service 获取目录树子节点-懒加载-默认数据
const service_getTreeSubNodesByLazy_default = async (nodeData: any, node: any) => {
    node.expanded = false;
    node.loading = true;

    let params = {
        dataSetId: nodeData.dataSetId,
        parentNodeIntId: nodeData.nodeIntId ? Number(nodeData.nodeIntId) : Number(nodeData.fileIntId),
        hostFileId: Number(nodeData.fileIntId),
    };

    const response = await REService.getSharedProjectTreeSubNodesByLazy(params);
    nodeData.subNodes = response.data.map((item: any) => {
        item['customNodeType'] = 'pakChildNode';
        item['dataSetType'] = nodeData.dataSetType;
        item['dataSetId'] = nodeData.dataSetId;
        item['fileIntId'] = nodeData.fileIntId;
        item['uniqueId'] = item.levelCode;
        item['nodeId'] = `${nodeData.dataSetId}-${item.levelCode}`;
        item['name'] = item.nodeName;
        item['enableLazyLoading'] = true;
        item.subNodes = [{ name: '' }];
        return item;
    });

    // 获取完数据，结束加载和处理勾选数据
    eltree_updataNode(node);
};

// MARK service 获取目录树子节点信息-单体化
const service_getTreeSubNodes_monomer = (nodeData: any, node: any) => {
    node.expanded = false;
    node.loading = true;

    const sceneTreeRef = ref_eltree.value;
    const tempNode: any = sceneTreeRef?.getNode(`tempNode-${nodeData.nodeId}`);
    sceneTreeRef?.remove(tempNode);

    const subNodes: any[] = [];
    if (nodeData.customNodeType === 'monomer') {
        const monomerInfo = nodeData.monomerizationInfo;

        const monomerUnits = monomerInfo.levelJson;
        monomerUnits.forEach((unit: any) => {
            unit.customNodeType = 'monomerUnit';
            unit.monomerRegNodeId = nodeData.nodeId;
            unit.monomerName = nodeData.monomerName;
            unit.monomerId = unit.id;
            unit.nodeId = unit.id;
            unit.nodeName = `${unit.name}单元`;
            unit.nodeType = 2;
            unit.dataSetType = nodeData.dataSetType;
            unit.displayMode = monomerInfo.displayMode;
            unit.dataSetId = monomerInfo.dataSetId;
            // 构建伪节点，用于展开单体化子节点 prettier-ignore
            unit.subNodes = [{ nodeId: `tempNode-${unit.nodeId}`, nodeName: '' }];
            subNodes.push(unit);
        });
    }

    if (nodeData.customNodeType === 'monomerUnit') {
        const monomerFloors = nodeData.floors;
        monomerFloors.forEach((floor: any) => {
            floor.customNodeType = 'monomerFloor';
            floor.monomerRegNodeId = nodeData.monomerRegNodeId;
            floor.monomerName = nodeData.monomerName;
            floor.monomerId = floor.id;
            floor.nodeId = floor.id;
            floor.nodeType = 2;
            floor.nodeName = `${nodeData.nodeName}${floor.name}`;
            floor.dataSetType = nodeData.dataSetType;
            floor.displayMode = nodeData.displayMode;
            floor.dataSetId = nodeData.dataSetId;
            // 构建伪节点，用于展开单体化子节点 prettier-ignore
            floor.subNodes = [{ nodeId: `tempNode-${floor.nodeId}`, nodeName: '' }];
            subNodes.push(floor);
        });
    }

    if (nodeData.customNodeType === 'monomerFloor') {
        const monomerRooms = nodeData.rooms;
        monomerRooms.forEach((room: any) => {
            room.customNodeType = 'monomerRoom';
            room.monomerRegNodeId = nodeData.monomerRegNodeId;
            room.monomerName = nodeData.monomerName;
            room.monomerId = room.id;
            room.nodeId = room.id;
            room.nodeName = `${nodeData.nodeName}${room.name}户`;
            room.nodeType = 2;
            room.dataSetType = nodeData.dataSetType;
            room.displayMode = nodeData.displayMode;
            room.dataSetId = nodeData.dataSetId;
            subNodes.push(room);
        });
    }
    sceneTreeRef?.updateKeyChildren(nodeData.nodeId, subNodes);

    // 获取完数据，结束加载和处理勾选数据
    eltree_updataNode(node);
};

// MARK service 根据节点列表获取单体化对象列表
const service_getMonomerByNodes = (nodeData: any) => {
    let monomerList: any[] = [];

    const flattenRooms = (rooms: any, source: any) => rooms.map((room: any) => createMonomerObj(source, room));
    const flattenFloors = (floors: any, source: any) => floors.flatMap((floor: any) => flattenRooms(floor.rooms, source));
    const flattenUnits = (units: any, source: any) => units.flatMap((unit: any) => flattenFloors(unit.floors, source));

    const createMonomerObj = (source: any, room: any) => ({
        displayMode: source.displayMode,
        dataSetId: source.dataSetId,
        monomerId: room.id,
        geoJson: room.geoJson,
    });

    // 主处理逻辑
    nodeData.forEach((item: any) => {
        switch (item.customNodeType) {
            case 'monomer': {
                // prettier-ignore
                const monomers = flattenUnits(item.monomerizationInfo.levelJson, item.monomerizationInfo)
                monomerList.push(...monomers);
                break;
            }
            case 'monomerUnit': {
                const unitMonomers = flattenFloors(item.floors, item);
                monomerList.push(...unitMonomers);
                break;
            }
            case 'monomerFloor': {
                const floorMonomers = flattenRooms(item.rooms, item);
                monomerList.push(...floorMonomers);
                break;
            }
            case 'monomerRoom': {
                monomerList.push(createMonomerObj(item, item));
                break;
            }
        }
    });

    return monomerList;
};

// MARK service 获取构件id-默认数据
const service_getElemIds_default = async (nodeData: any) => {
    if (nodeData.enableLazyLoading) {
        let params = {
            dataSetId: nodeData.dataSetId,
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
    let { componentPosition } = sceneInfo.value;
    allDatasets.forEach((item: any) => {
        item['customNodeType'] = 'dataSet';
        item['nodeId'] = item.sceneNodeId;
        item['nodeName'] = item.sceneNodeName;

        if (item.viewStatus === 2) {
            item['disabled'] = true;
        }

        if (item.dataSetType === 0 && item.viewStatus !== 2) {
            item.subNodes.push({ nodeName: '' });
        }

        if (item.dataSetType === 19) {
            let componentInfo = item.componentInfo;
            componentInfo.id = componentInfo.treeNodeId;
            let find = componentPosition.find((el: any) => el.id === componentInfo.id);
            if (find) {
                componentInfo.location = {
                    rotate: find.rotate,
                    scale: find.scale,
                    translation: find.translation,
                };
            }
            let { hostFileId, instanceIndex, isPublished } = componentInfo;
            if (isPublished) {
                componentInfo.dataSetId = sceneInfo.value.componentTreeId;
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

        if (item.dataSetType === 25) {
            item.customNodeType = 'monomer';
            item.monomerId = item.nodeId;
            item.monomerName = item.nodeName;
            item.monomerizationInfo = handle_formatMonomerInfo(item.monomerizationInfo);
            const monomerInfo = item.monomerizationInfo;
            if (monomerInfo.monomerizationType === 2) {
                // 构建伪节点，用于展开单体化子节点
                item.subNodes = [{ nodeId: `tempNode-${item.nodeId}`, nodeName: '', viewStatus: item.viewStatus }];
            }
        }
    });

    // 隐藏没有数据的根节点
    sceneData = sceneData.filter((el: any) => el.subNodes.length);
    return sceneData;
};

// MARK data 格式化-单体化信息对象
const handle_formatMonomerInfo = (monomerInfo: any) => {
    const units = monomerInfo.levelJson;
    const firstRoom = units[0].floors[0].rooms[0];
    const firstRoomGeoJson = JSON.parse(firstRoom.geoJson);
    if (firstRoomGeoJson.rgnList) return monomerInfo;

    const dataSetId = monomerInfo.dataSetId;
    const rooms = units.flatMap((unit: any) => unit.floors.flatMap((floor: any) => floor.rooms));
    rooms.forEach((room: any) => {
        const roomGeoJson = JSON.parse(room.geoJson);
        const fenceClr = roomGeoJson.fenceClr;
        const { red, green, blue, alpha } = fenceClr;
        const monomerClr = { red, green, blue, alpha: 128 };
        const heightMin = roomGeoJson.potList[0][2];
        const heightMax = roomGeoJson.potList[0][2] + roomGeoJson.potList[0][3];
        const pointList = roomGeoJson.potList.map((el: any) => el.slice(0, 3));

        const groJson = {
            dataSetId,
            rgnList: [pointList],
            heightMin,
            heightMax,
            monomerClr,
        };
        room.geoJson = JSON.stringify(groJson);
    });

    return monomerInfo;
};

// MARK data 格式化-单体化树结构
const handle_formatMonomerData = (monomerTreeNode: any) => {
    const monomerInfo = monomerTreeNode.monomerizationInfo;

    if (monomerInfo.monomerizationType === 1) {
        // 整体
        monomerTreeNode.customNodeType = 'monomer';
        const units = monomerInfo.levelJson;
        const roomInfo = units[0]?.floors[0]?.rooms[0];
        monomerTreeNode.monomerId = roomInfo.id;
        roomInfo.monomerId = roomInfo.id;
        return monomerTreeNode;
    } else {
        // 分层分户
        monomerTreeNode.monomerId = monomerTreeNode.dataSetId;
        let subNodes: any[] = [];
        const monomerUnits = monomerInfo.levelJson;
        monomerUnits.forEach((unit: any) => {
            unit.customNodeType = 'monomerUnit';
            unit.monomerId = unit.id;
            unit.nodeId = unit.id;
            unit.nodeName = `${unit.name}单元`;
            unit.nodeType = 2;
            unit.viewStatus = monomerTreeNode.viewStatus;
            unit.dataSetType = monomerTreeNode.dataSetType;
            let unitSubNodes: any[] = [];
            const monomerFloors = unit.floors;
            monomerFloors.forEach((floor: any) => {
                floor.customNodeType = 'monomerFloor';
                floor.monomerId = floor.id;
                floor.nodeId = floor.id;
                floor.nodeName = `${floor.name}`;
                floor.nodeType = 2;
                floor.viewStatus = monomerTreeNode.viewStatus;
                floor.dataSetType = monomerTreeNode.dataSetType;
                let floorSubNodes: any[] = [];
                const monomerRooms = floor.rooms;
                monomerRooms.forEach((room: any) => {
                    room.customNodeType = 'monomerRoom';
                    room.monomerId = room.id;
                    room.nodeId = room.id;
                    room.nodeName = `${floor.name}${room.name}户`;
                    room.nodeType = 2;
                    room.viewStatus = monomerTreeNode.viewStatus;
                    room.dataSetType = monomerTreeNode.dataSetType;
                    room.displayMode = monomerInfo.displayMode;
                    room.dataSetId = monomerInfo.dataSetId;
                    floorSubNodes.push(room);
                });
                floor.subNodes = floorSubNodes;
                unitSubNodes.push(floor);
            });
            unit.subNodes = unitSubNodes;
            subNodes.push(unit);
        });
        monomerTreeNode.subNodes = subNodes;
        return monomerTreeNode;
    }
};

// MARK data 格式化-数据集子节点
const handle_formatDataSetSubNodes = (dataSetInfo: any, subNodes: any) => {
    const { dataSetId, dataSetType } = dataSetInfo;
    const formatType = subNodes[0]?.formatType;
    if (formatType === 1) {
        let treeData = subNodes[0].files;
        treeData.forEach((item: any) => {
            item['customNodeType'] = 'pakFile';
            item['formatType'] = formatType;
            item['nodeName'] = item.fileName;
            item['nodeId'] = `${dataSetId}-${item.uniqueId}`;
            item['dataSetType'] = dataSetType;
            item['dataSetId'] = dataSetId;
            item.subNodes = [{ nodeName: '' }];
            if (isRvtGroupMode.value && !item.hasRvtGroup) {
                item.subNodes = [];
            }
        });
        return treeData;
    }
    if (formatType === 2) {
        subNodes.forEach((item: any) => {
            item.subNodes = item.files;
            item.subNodes.forEach((node: any) => {
                node['customNodeType'] = 'pakFile';
                item['formatType'] = formatType;
                node['nodeName'] = node.fileName;
                node['nodeId'] = `${dataSetId}-${node.uniqueId}`;
                node['dataSetType'] = dataSetType;
                node['dataSetId'] = dataSetId;
                node.subNodes = [{ nodeName: '' }];
                if (isRvtGroupMode.value && !node.hasRvtGroup) {
                    node.subNodes = [];
                }
            });
        });
        let treeData = subNodes[0].subNodes;
        return treeData;
    }
};

// MARK data 格式化-数据集子节点
const handle_formatPakChildNode = (pakNodeInfo: any, subNodes: any) => {
    const { dataSetId, dataSetType } = pakNodeInfo;

    for (let node of subNodes) {
        node['childNodeId'] = node.nodeId;
        node['nodeId'] = `${dataSetId}-${node.uniqueId ? node.uniqueId : node.levelCode}`;
        node['nodeName'] = node.name ? node.name : node.nodeName;
        node['subNodes'] = node.nodes;
        node['customNodeType'] = 'pakChildNode';
        node['dataSetType'] = dataSetType;
        node['dataSetId'] = dataSetId;
        if (node.subNodes && node.subNodes.length) {
            handle_formatPakChildNode(pakNodeInfo, node.subNodes);
        }
    }
    return subNodes;
};

// MARK data 处理数据-获取构件id请求参数-默认数据
const handle_getRequestParam_default = (nodeData: any) => {
    let dataSetId = nodeData.dataSetId;
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

    const childNodeIds = handle_findAllKeyValues(nodeData, 'childNodeId');
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
    const childNodeIds = handle_findAllKeyValues(nodeData, 'childNodeId');
    const fileNodeData = handle_findFileNode(node);
    let params = {
        dataSetId: nodeData.dataSetId,
        hostFileId: fileNodeData.fileIntId,
        childNodeId: childNodeIds,
    };
    return params;
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

// MARK data 判断-单体化数据
const handle_isMonomerNode = (nodeData: any) => {
    let dataSetType = nodeData.dataSetType;
    return dataSetType === 25;
};

// MARK data 查找-所有节点指定keys
const handle_findAllKeys = (nodeData: any, key: string) => {
    const array: any = [];
    const traverse = (item: any) => {
        if (item[key]) {
            array.push(item[key]);
        }
        if (item.subNodes && item.subNodes.length) {
            item.subNodes.forEach((subNode: any) => {
                traverse(subNode);
            });
        }
    };

    nodeData.forEach((item: any) => {
        traverse(item);
    });
    return array;
};

// MARK data 查找-节点级别数据
const handle_findAllNodeByLevel = (nodeData: any, level: number) => {
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

    nodeData.forEach((item: any) => {
        traverse(item);
    });

    return array;
};

// MARK data 处理数据-获取数据集类型和id-过滤掉非模型数据
const handle_findModelTypeDataSetList = (allDatasets: any) => {
    const noModelTypeList = state_store.notModelTypeList;
    const dataSets = allDatasets
        .filter((el: any) => !noModelTypeList.includes(el.dataSetType))
        .map((item: any) => {
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

// MARK data 查找-所有指定key的数据
const handle_findAllKeyValues = (nodeData: any, key: string, subNodesKey: string = 'subNodes', viewStatus: any = false) => {
    let keyValueArray: any[] = [];
    const recursionFunc = (node: any) => {
        if (viewStatus || viewStatus === 0) {
            if (node[key] && node.viewStatus === viewStatus) {
                keyValueArray.push(node[key]);
            }
        } else {
            if (node[key]) {
                keyValueArray.push(node[key]);
            }
        }
        if (node[subNodesKey] && Array.isArray(node[subNodesKey]) && node[subNodesKey].length) {
            node[subNodesKey].forEach((subNode: any) => {
                recursionFunc(subNode);
            });
        }
    };
    const nodes = nodeData[subNodesKey] && nodeData[subNodesKey].length ? nodeData[subNodesKey] : [nodeData]; // 如果没有子节点，为了完成循环操作，包装一下
    nodes.forEach((node: any) => {
        recursionFunc(node);
    });

    return keyValueArray;
};

// MARK data 查找-所有指定数据类型的指定keys
const handle_findAllKeysByType = (nodeData: any, type: number, key: string) => {
    return nodeData.filter((el: any) => el.dataSetType === type).map((item: any) => item[key]);
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

// MARK eltree 更新目录树显示数据类型
const eltree_updateShowType = () => {
    // 步骤1：先获取el-tree实例，提前缓存（避免多次获取ref）
    const domRef = ref_eltree.value;
    if (!domRef) return;

    // 步骤2：【核心修复1】完整保存「子节点勾选明细」+ 父节点半选状态（解决丢失问题）
    // 关键：优先保存所有叶子节点（子节点）的勾选状态，这是还原半选/全选的基础
    let savedLeafCheckedKeys: any[] = []; // 核心：保存所有已勾选的子节点（叶子节点）id
    let savedParentIndeterminateKeys: any[] = []; // 保存半选的父节点id（仅false模式）
    const currentIsRvtGroupMode = isRvtGroupMode.value;

    // 1. 先获取所有叶子节点（子节点）的勾选状态（精准保留子节点勾选明细：3选2的状态）
    const allLeafCheckedNodes = domRef.getCheckedNodes(true, false); // 第一个true：仅返回叶子节点（子节点）
    savedLeafCheckedKeys = allLeafCheckedNodes.map((nodeData: any) => nodeData.nodeId);

    // 2. 再获取半选的父节点（仅当前为false模式时）
    if (!currentIsRvtGroupMode) {
        const allNodes = domRef.getCheckedNodes(false, true); // 第一个false：返回所有节点（包含父节点）
        savedParentIndeterminateKeys = allNodes
            .filter((nodeData: any) => {
                const node = domRef.getNode(nodeData.nodeId);
                // 筛选：父节点 + 半选状态 + 非叶子节点
                return node && node.indeterminate === true && !node.isLeaf;
            })
            .map((nodeData: any) => nodeData.nodeId);
    }

    // 步骤3：切换模式前，仅清空无效状态，保留子节点勾选明细的缓存（不销毁核心数据）
    domRef.setCheckedKeys([]); // 清空当前勾选，避免状态混乱，但缓存已保存
    // 清空残留半选状态（仅为了样式干净，不影响缓存的子节点数据）
    const allCurrentNodes = domRef.getCheckedNodes(false, true);
    allCurrentNodes.forEach((nodeData: any) => {
        const node = domRef.getNode(nodeData.nodeId);
        if (node && node.indeterminate !== undefined) {
            node.indeterminate = false;
        }
    });

    isRvtGroupMode.value = !isRvtGroupMode.value;
    let allDatasets = handle_findAllNodeByLevel(treeList.value, 2);
    const bimDataSets = allDatasets.filter((el: any) => el.dataSetType === 0 && el.viewStatus !== 2);

    let fileNodes: any[] = [];
    bimDataSets.forEach((dataSet: any) => {
        if (dataSet.fileIntId) {
            fileNodes.push(dataSet);
        } else {
            const subNodes = dataSet.subNodes;
            let filterFileNodes = subNodes.filter((el: any) => el.customNodeType === 'pakFile');
            fileNodes = [...filterFileNodes, ...fileNodes];
        }
    });

    const treeDataMap = isRvtGroupMode.value ? rvtGroupTreeData.value : defaultTreeData.value;

    // 重置展开状态
    fileNodes.forEach((item: any) => {
        const node: any = domRef?.getNode(item.nodeId);
        node.expanded = false;
    });

    // 重置高亮状态
    domRef?.setCurrentKey('');

    // 配置数据
    nextTick(async () => {
        // 填充子节点数据，将保存的数据进行覆盖
        for (const item of fileNodes) {
            const find = treeDataMap.find((el: any) => el.parentNodeId === item.nodeId);
            if (find) {
                item.subNodes = find.subNodes;
            } else {
                item.subNodes = [{ name: '' }];
            }
            if (isRvtGroupMode.value && !item.hasRvtGroup) {
                item.subNodes = [];
            }
        }

        // 步骤8：【核心修复2】基于子节点勾选明细，差异化恢复状态（解决3选2丢失问题）
        let visibleDataSets: any[] = [];
        let finalCheckedKeys: any[] = [...savedLeafCheckedKeys]; // 优先还原子节点勾选明细

        // 原业务逻辑 - 处理可见数据集（保留不变，仅优化去重）
        const newAllNodes = domRef.getCheckedNodes(true, false);
        newAllNodes.forEach((nodeData: any) => {
            const find = bimDataSets.find((el: any) => el.dataSetId === nodeData.dataSetId);
            const isExsist = visibleDataSets.find((el: any) => el.dataSetId === nodeData.dataSetId);
            if (find && !isExsist) {
                visibleDataSets.push(find);
            }
        });

        // 处理BIM节点勾选，去重避免多余节点（保留子节点明细优先级）
        const visibleDataSetIds = visibleDataSets.map((el: any) => el.dataSetId);
        const checkedBimKeys = handle_findAllKeys(visibleDataSets, 'nodeId');
        const checkedKeySet = new Set([...finalCheckedKeys, ...checkedBimKeys]);
        finalCheckedKeys = Array.from(checkedKeySet);

        // 步骤9：原业务逻辑 - 更新BIM模型显示状态（保留不变）
        let hiddenDataSets: any[] = bimDataSets.filter((el: any) => !visibleDataSetIds.includes(el.dataSetId));
        visibleDataSets = handle_findModelTypeDataSetList(visibleDataSets);
        props.dataSetVisible?.(visibleDataSets, true);
        hiddenDataSets = handle_findModelTypeDataSetList(hiddenDataSets);
        props.dataSetVisible?.(hiddenDataSets, false);

        // 步骤10：【核心修复3】基于模式，自动还原勾选/半选状态（利用el-tree原生逻辑）
        await nextTick(); // 等待DOM数据更新完成

        // 先清空当前勾选（二次保险）
        domRef.setCheckedKeys([]);

        // 关键：优先还原子节点勾选明细，让el-tree自动生成父节点状态
        if (finalCheckedKeys.length > 0) {
            domRef.setCheckedKeys(finalCheckedKeys);
        }

        // 差异化处理两种模式，还原对应状态
        if (!isRvtGroupMode.value) {
            // 模式：false（支持半选）- 由el-tree自动生成父节点半选（3选2时，父节点自动半选）
            // 补充：若需强制还原特定父节点半选，可手动触发（一般无需，el-tree原生逻辑已足够）
            savedParentIndeterminateKeys.forEach((parentNodeId: any) => {
                const parentNode = domRef.getNode(parentNodeId);
                if (parentNode && parentNode.indeterminate !== undefined) {
                    // 验证子节点勾选状态，确保半选逻辑正确（3选2）
                    const childNodes = parentNode.childNodes || [];
                    const checkedChildCount = childNodes.filter((child: any) => child.checked).length;
                    if (checkedChildCount > 0 && checkedChildCount < childNodes.length) {
                        parentNode.indeterminate = true;
                    }
                }
            });
        } else {
            // 模式：true（无半选，父选子全选/子选不联动父）
            // 补充：若需要「父节点勾选联动子节点全选」，可基于子节点明细找到父节点勾选
            finalCheckedKeys.forEach((leafNodeId: any) => {
                const leafNode = domRef.getNode(leafNodeId);
                if (leafNode && !leafNode.isLeaf) return;

                // 找到父节点，可选：勾选父节点（触发子节点全选）
                const parentNode = leafNode?.parent;
                if (parentNode && parentNode.data && !finalCheckedKeys.includes(parentNode.data.nodeId)) {
                    // 若需要父节点勾选，添加此行；若仅保留子节点勾选，注释此行
                    // finalCheckedKeys.push(parentNode.data.nodeId);
                }
            });

            // 重新赋值并去重，确保勾选状态纯净
            const finalKeySet = new Set(finalCheckedKeys);
            domRef.setCheckedKeys(Array.from(finalKeySet));

            // 强制清空所有半选状态，确保无半选样式
            const allNodes = domRef.getCheckedNodes(false, true);
            allNodes.forEach((nodeData: any) => {
                const node = domRef.getNode(nodeData.nodeId);
                if (node && node.indeterminate !== undefined) {
                    node.indeterminate = false;
                }
            });
        }

        // // 勾选节点
        // // 步骤7：【核心修复3】重新处理勾选状态，先清空旧残留，再筛选有效节点
        // // 注意：此时先获取最新节点（数据替换后），避免使用旧的checkedNodes
        // let newCheckedNodes: any = domRef.getCheckedNodes(true, false); // 排除半选，避免无效数据
        // let checkedNodes: any = domRef?.getCheckedNodes();
        // let visibleDataSets: any[] = [];
        // let checkedKeys: any[] = [...validOldCheckedKeys]; // 初始化：保留之前筛选的有效勾选
        // // let checkedKeys: any[] = [];
        // let indeterminateNodes: any[] = [];
        // // checkedNodes.forEach((nodeData: any) => {
        // //     if (nodeData.dataSetType !== 0 || nodeData.nodeType !== 2) {
        // //         let node: any = domRef?.getNode(nodeData.nodeId);
        // //         // 【修复4】严格校验节点存在性和indeterminate属性可用性，避免崩溃
        // //         if (node && node.indeterminate !== undefined && !isRvtGroupMode.value) {
        // //             // if (node.indeterminate) {
        // //             indeterminateNodes.push(nodeData);
        // //         } else {
        // //             let findKey = checkedKeys.find((el: any) => el === nodeData.nodeId);
        // //             if (!findKey) {
        // //                 checkedKeys.push(nodeData.nodeId);
        // //             }
        // //         }
        // //     }
        // //     const find = bimDataSets.find((el: any) => el.dataSetId === nodeData.dataSetId);
        // //     const isExsist = visibleDataSets.find((el: any) => el.dataSetId === nodeData.dataSetId);
        // //     if (find && !isExsist) {
        // //         visibleDataSets.push(find);
        // //     }
        // // });

        // newCheckedNodes.forEach((nodeData: any) => {
        //     if (nodeData.dataSetType !== 0 || nodeData.nodeType !== 2) {
        //         const node: any = domRef?.getNode(nodeData.nodeId);
        //         // 区分模式处理半选节点
        //         if (!isRvtGroupMode.value) {
        //             // 模式：false（支持半选），安全校验并收集半选节点
        //             if (node && node.indeterminate !== undefined) {
        //                 indeterminateNodes.push(nodeData);
        //             }
        //         } else {
        //             // 模式：true（无半选），直接收集勾选节点，跳过半选判断
        //             const findKey = checkedKeys.find((el: any) => el === nodeData.nodeId);
        //             if (!findKey) {
        //                 checkedKeys.push(nodeData.nodeId);
        //             }
        //         }
        //     }
        //     const find = bimDataSets.find((el: any) => el.dataSetId === nodeData.dataSetId);
        //     const isExsist = visibleDataSets.find((el: any) => el.dataSetId === nodeData.dataSetId);
        //     if (find && !isExsist) {
        //         visibleDataSets.push(find);
        //     }
        // });

        // const visibleDataSetIds = visibleDataSets.map((el: any) => el.dataSetId);
        // const checkedBimKeys = handle_findAllKeys(visibleDataSets, 'nodeId');
        // // 去重优化：使用Set避免重复
        // const checkedKeySet = new Set([...checkedKeys, ...checkedBimKeys]);
        // checkedKeys = Array.from(checkedKeySet);
        // // checkedKeys = [...checkedBimKeys, ...checkedKeys];

        // let hiddenDataSets: any[] = bimDataSets.filter((el: any) => !visibleDataSetIds.includes(el.dataSetId));

        // // 更新调整后的bim模型显示状态
        // visibleDataSets = handle_findModelTypeDataSetList(visibleDataSets);
        // props.dataSetVisible?.(visibleDataSets, true);

        // hiddenDataSets = handle_findModelTypeDataSetList(hiddenDataSets);
        // props.dataSetVisible?.(hiddenDataSets, false);

        // // 步骤8：【修复6】优化勾选恢复时机，且仅在对应模式下处理半选状态
        // await nextTick(); // 等待上一个DOM操作完成（数据覆盖）

        // // 先清空当前勾选（二次保险，避免残留）
        // domRef.setCheckedKeys([]);

        // // 再恢复有效勾选节点
        // if (checkedKeys.length > 0) {
        //     domRef.setCheckedKeys(checkedKeys);
        // }

        // // 仅在模式为false（支持半选）时，恢复半选状态（包含历史半选数据）
        // if (!isRvtGroupMode.value) {
        //     // 合并历史半选节点和当前半选节点，去重
        //     const allIndeterminateKeys = new Set([...validOldIndeterminateKeys, ...indeterminateNodes.map((item: any) => item.nodeId)]);
        //     // 恢复半选状态，安全校验避免崩溃
        //     Array.from(allIndeterminateKeys).forEach((nodeId: any) => {
        //         const node: any = domRef?.getNode(nodeId);
        //         if (node && node.indeterminate !== undefined) {
        //             node.indeterminate = true;
        //         }
        //     });
        // } else {
        //     // 模式：true（无半选），强制清空所有可能的半选残留，确保无半选样式
        //     const allNodes = domRef.getCheckedNodes(true, true);
        //     allNodes.forEach((nodeData: any) => {
        //         const node = domRef.getNode(nodeData.nodeId);
        //         if (node && node.indeterminate !== undefined) {
        //             node.indeterminate = false;
        //         }
        //     });
        // }

        // nextTick(() => {
        //     // 必须再次嵌套一个nextTick, 等待上一个dom覆盖数据完成
        //     domRef?.setCheckedKeys(checkedKeys);
        // });

        // indeterminateNodes.forEach((item: any) => {
        //     let node: any = domRef?.getNode(item.nodeId);
        //     node.indeterminate = true;
        // });
    });
};

// // MARK eltree 节点被展开
const eltree_nodeExpand = (nodeData: any, node: any) => {
    if (nodeData.dataSetType === 25) {
        eltree_nodeExpand_monomer(nodeData, node);
        return;
    }

    if (!nodeData.customNodeType) return;
    if (nodeData.dataSetType !== 0) return;

    if (isRvtGroupMode.value) {
        const fileNodeData = handle_findFileNode(node);
        if (!fileNodeData.hasRvtGroup) {
            nodeData.subNodes = [];
            return;
        }
        eltree_nodeExpand_group(nodeData, node);
    } else {
        eltree_nodeExpand_default(nodeData, node);
    }
};

// MARK eltree 节点-被展开-分组数据
const eltree_nodeExpand_group = (nodeData: any, node: any) => {
    // 如果已经展开则处理子节点勾选状态
    const isNodeExpanded = nodeData.subNodes[0]?.uniqueId;
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
    // 如果已经展开则处理子节点勾选状态
    const isNodeExpanded = nodeData.subNodes[0]?.uniqueId;
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

// MARK eltree 节点-被展开-单体化数据
const eltree_nodeExpand_monomer = (nodeData: any, node: any) => {
    // 如果是单体化根节点或者文件夹节点，直接展开
    if (nodeData.nodeType !== 2) return;

    // 如果已经展开则处理子节点勾选状态
    let isNodeExpanded_monomer = false;
    const nodeId = nodeData.subNodes[0]?.nodeId;
    if (nodeId && !nodeId.includes('tempNode')) {
        isNodeExpanded_monomer = true;
    }
    if (isNodeExpanded_monomer) {
        if (node.checked) {
            node.childNodes.forEach((item: any) => {
                item.checked = true;
            });
        }
        return;
    }

    service_getTreeSubNodes_monomer(nodeData, node);
};

// MARK eltree 节点被点击
const eltree_nodeClick = async (nodeData: any, node: any) => {
    if (handle_isWaterNode(nodeData)) {
        const leafNodes = handle_findAllNodeByLevel([nodeData], 2);
        const waterIds = leafNodes.map((item: any) => item.waterId);
        engine_camToWater(waterIds);
        return;
    }

    if (handle_isExtrudeNode(nodeData)) {
        const leafNodes = handle_findAllNodeByLevel([nodeData], 2);
        const extrudeIds = leafNodes.map((item: any) => item.extrudeId);
        engine_camToExtrude(extrudeIds);
        return;
    }

    if (handle_isMonomerNode(nodeData)) {
        let monomerList: any[] = [];
        if (!nodeData.customNodeType) {
            const leafNodes = handle_findAllNodeByLevel([nodeData], 2);
            monomerList = service_getMonomerByNodes(leafNodes);
        } else {
            monomerList = service_getMonomerByNodes([nodeData]);
        }
        const monomerIds = monomerList.map((item: any) => item.monomerId);
        engine_camToMonomer(monomerIds);
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

    if (nodeData.customNodeType === 'pakFile') {
        const elemIds = await service_getElemIds_default(nodeData);
        if (elemIds.length) {
            const dataSetId = nodeData.dataSetId;
            // const dataSetId = nodeData.dataSetId.replaceAll('-', '')
            const dataSets = [{ dataSetId, elemIds: elemIds }];
            engine_camToElem(dataSets);
        }
        return;
    }

    if (isRvtGroupMode.value) {
        const elemIds = await service_getElemIds_group(nodeData, node);
        if (elemIds.length) {
            const dataSetId = nodeData.dataSetId;
            // const dataSetId = nodeData.dataSetId.replaceAll('-', '');
            const dataSets = [{ dataSetId, elemIds: elemIds }];
            engine_camToElem(dataSets);
        }
    } else {
        const elemIds = await service_getElemIds_default(nodeData);
        if (elemIds.length) {
            const dataSetId = nodeData.dataSetId;
            // const dataSetId = nodeData.dataSetId.replaceAll('-', '')
            const dataSets = [{ dataSetId, elemIds: elemIds }];
            engine_camToElem(dataSets);
        }
    }
};

// MARK eltree 节点复选框被点击
const eltree_check = async (nodeData: any) => {
    const node: any = ref_eltree.value?.getNode(nodeData);

    if (handle_isWaterNode(nodeData)) {
        let leafNodes = handle_findAllNodeByLevel([nodeData], 2);
        let waterIds = leafNodes.map((item: any) => item.waterId);
        engine_waterVisible(waterIds, node.checked);

        if (isRvtGroupMode.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
            eltree_check_parentNodesCheckStatus(node.parent);
        }
        return;
    }

    if (handle_isExtrudeNode(nodeData)) {
        let leafNodes = handle_findAllNodeByLevel([nodeData], 2);
        let extrudeIds = leafNodes.map((item: any) => item.extrudeId);
        engine_extrudeVisible(extrudeIds, node.checked);

        if (isRvtGroupMode.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
            eltree_check_parentNodesCheckStatus(node.parent);
        }
        return;
    }

    if (handle_isMonomerNode(nodeData)) {
        let monomerList: any[] = [];
        if (!nodeData.customNodeType) {
            let leafNodes = handle_findAllNodeByLevel([nodeData], 2);
            leafNodes = leafNodes.filter((item: any) => item.customNodeType === 'monomer');
            monomerList = service_getMonomerByNodes(leafNodes);
        } else {
            monomerList = service_getMonomerByNodes([nodeData]);
        }
        const monomerIds = monomerList.map((item: any) => item.monomerId);

        engine_monomerVisible(monomerIds, node.checked);

        if (isRvtGroupMode.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
            eltree_check_parentNodesCheckStatus(node.parent);
        }
        return;
    }

    if (nodeData.dataSetType !== 0) {
        const allDatasets = handle_findAllNodeByLevel([nodeData], 2);
        let dataSets = handle_findModelTypeDataSetList(allDatasets);
        props.dataSetVisible?.(dataSets, node.checked);

        if (isRvtGroupMode.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
            eltree_check_parentNodesCheckStatus(node.parent);
        }
        return;
    }

    if (!nodeData.customNodeType) {
        let allDatasets = handle_findAllNodeByLevel(nodeData.subNodes, 2);
        let dataSets = handle_findModelTypeDataSetList(allDatasets);
        props.dataSetVisible?.(dataSets, node.checked);

        if (isRvtGroupMode.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
        }
        return;
    }

    if (nodeData.customNodeType === 'dataSet') {
        let dataSets = handle_findModelTypeDataSetList([nodeData]);
        props.dataSetVisible?.(dataSets, node.checked);

        if (isRvtGroupMode.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
        }
        return;
    }

    if (nodeData.customNodeType === 'pakFile') {
        const elemIds = await service_getElemIds_default(nodeData);
        if (elemIds.length) {
            let dataSetId = nodeData.dataSetId;
            // let dataSetId = nodeData.dataSetId.replace(/-/g, '');
            props.elemVisible?.(dataSetId, elemIds, node.checked);
        }

        if (isRvtGroupMode.value) {
            eltree_check_childNodesCheckStatus(nodeData, node.checked);
        }
        return;
    }

    if (isRvtGroupMode.value) {
        const elemIds = await service_getElemIds_group(nodeData, node);
        if (elemIds.length) {
            const dataSetId = nodeData.dataSetId;
            // const dataSetId = nodeData.dataSetId.replaceAll('-', '');
            props.elemVisible?.(dataSetId, elemIds, node.checked);
        }
        eltree_check_childNodesCheckStatus(nodeData, node.checked);
    } else {
        const elemIds = await service_getElemIds_default(nodeData);
        if (elemIds.length) {
            let dataSetId = nodeData.dataSetId;
            // let dataSetId = nodeData.dataSetId.replace(/-/g, '');
            props.elemVisible?.(dataSetId, elemIds, node.checked);
        }
    }
};

// MARK eltree 节点复选框-子节点选择状态
const eltree_check_childNodesCheckStatus = (nodeData: any, checked: boolean) => {
    const childNodeKeys = handle_findAllKeyValues(nodeData, 'nodeId', 'subNodes');
    childNodeKeys.forEach((key: any) => {
        const node: any = ref_eltree.value?.getNode(key);
        if (node) {
            node.checked = checked;
        }
    });
};

// MARK eltree 节点复选框-父节点选择状态
const eltree_check_parentNodesCheckStatus = (node: any) => {
    if (!node) return;

    const childNodes = node.childNodes;

    // 检查子节点状态
    const checkedCount = childNodes.filter((el: any) => el.checked).length;
    const total = childNodes.length;

    // 设置当前节点状态
    if (checkedCount === 0) {
        // 全部未选中
        node.checked = false;
        node.indeterminate = false;
    } else if (checkedCount === total) {
        // 全部选中
        node.checked = true;
        node.indeterminate = false;
    } else {
        // 部分选中
        node.checked = false;
        node.indeterminate = true;
    }

    // 递归处理父节点
    if (node.parent) {
        eltree_check_parentNodesCheckStatus(node.parent);
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
            const haveNotChecked = handle_findAllKeyValues(item, 'nodeId', 'subNodes', 0);
            const allIds = handle_findAllKeyValues(item, 'nodeId', 'subNodes', false);
            node.expanded = true;
            node.checked = item?.viewStatus === 0;
            if (allIds.length > haveNotChecked.length && allIds.length !== 0 && haveNotChecked.length) {
                node.indeterminate = true;
            }
        });

        allFolders.forEach((item: any) => {
            let node = domRef.getNode(item.nodeId);
            node.checked = item?.viewStatus === 0;
        });

        allDatasets.forEach((item: any) => {
            let node = domRef.getNode(item.nodeId);
            node.checked = item?.viewStatus === 0;
        });
        /**
         * 平台这里后续会处理发布后默认不显示的数据，
         * 但是由于app和平台的加载逻辑不同，app是先构成了数据集信息保存，平台是先构建目录树，
         * 先后顺序不同，app后续发出模型数据加载完成的通知，在后续时机再处理不显示数据
         * */
    });
};

// MARK Engine 模型加载完成回调
const engine_callback_loadDataSetFinish = () => {
    console.log('666');
    engine_initStyle();
};

// MARK Engine 初始化样式
const engine_initStyle = () => {
    // 合适时机再处理发布默认不显示的数据
    let allDatasets = handle_findAllNodeByLevel(treeList.value, 2);
    const allNotCheckNodes: any[] = []; //所有默认不选中的节点数据

    let domRef: any = ref_eltree.value;
    allDatasets.forEach((item: any) => {
        let node = domRef.getNode(item.nodeId);
        if (!node.checked) {
            allNotCheckNodes.push(item);
        }
    });
    if (allNotCheckNodes.length) {
        let dataSets = handle_findModelTypeDataSetList(allNotCheckNodes);
        props.dataSetVisible?.(dataSets, false);

        const waterIdList = handle_findAllKeysByType(allNotCheckNodes, 23, 'waterId');
        engine_waterVisible(waterIdList, false);

        const extrudeIdList = handle_findAllKeysByType(allNotCheckNodes, 24, 'extrudeId');
        engine_extrudeVisible(extrudeIdList, false);
    }
};

// MARK Engine 定位水面
const engine_camToWater = (waterIdList: any) => {
    props.camToWater?.(waterIdList);
};

// MARK Engine 定位挤出
const engine_camToExtrude = (extrudeIdList: any) => {
    props.camToExtrude?.(extrudeIdList);
};

// MARK Engine 定位单体化
const engine_camToMonomer = (monomerIdList: any) => {
    props.camToMonomer?.(monomerIdList);
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
const engine_waterVisible = (waterIdList: any, visible: boolean) => {
    props.waterVisible?.(waterIdList, visible);
};

// MARK Engine 挤出显示隐藏
const engine_extrudeVisible = (extrudeIdList: any, visible: boolean) => {
    props.extrudeVisible?.(extrudeIdList, visible);
};

// MARK Engine 单体化显示隐藏
const engine_monomerVisible = (monomerIdList: any, visible: boolean) => {
    props.monomerVisible?.(monomerIdList, visible);
};
// MARK 暴露方法给父组件
defineExpose({
    engine_callback_loadDataSetFinish,
});
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

            .custom-node-box {
                display: flex;
                justify-content: space-between;
                flex-grow: 1;
                overflow: hidden;

                .node-label-box {
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    color: white;

                    .label-box {
                        margin-left: 5px;
                        font-size: 14px;
                        font-weight: 400;

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
                    }
                }

                .node-label-bold {
                    font-weight: bold;
                }
                .node-label-bold .icon-box {
                    font-weight: normal;
                }

                .custom-button-box {
                    padding: 0px 10px;

                    .button-item-box {
                        .btn-icon-box {
                            display: flex;
                            align-items: center;
                            gap: 8px;

                            .iconfont {
                                &:hover {
                                    color: var(--color-main-blue) !important;
                                }

                                &.active {
                                    color: var(--color-main-blue) !important;
                                }
                            }
                        }
                    }
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
}
</style>
