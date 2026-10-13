import { useStateStore } from '@/stores/state';
import entityTool from '@/utils/entityTool';



interface ApiMethods {
    handle_formatSceneTree(sceneTree: any, sceneInfo: any): any;
    handle_findAllNodeByLevel(nodeData: any, level: number): any;
    handle_formatMonomerInfo(monomerInfo: any): any;
}

const api: ApiMethods = {
    // MARK data 格式化-场景树
    handle_formatSceneTree: (sceneTree: any, sceneInfo: any) => {
        if (!sceneTree) return [];
        let sceneData = sceneTree;
        let rootFolders = api.handle_findAllNodeByLevel(sceneData, 3);

        rootFolders.forEach((item: any) => {
            if (item.dataSetType === 0) {
                item['sceneNodeName'] = 'BIM'
                item['nodeName'] = 'BIM'
                item['levelPathName'] = 'BIM'
            }
            if (item.dataSetType === 10) {
                item['sceneNodeName'] = 'WMTS'
                item['nodeName'] = 'WMTS'
                item['levelPathName'] = 'WMTS'
            }
        })


        let allDatasets = api.handle_findAllNodeByLevel(sceneData, 2);
        let { componentPosition } = sceneInfo;
        allDatasets.forEach((item: any) => {
            if (item.dataSetType === 0) {
                item['levelPathName'] = item.levelPathName.replace('模型/', 'BIM/')
                item['levelPathName'] = item.levelPathName.replace('模型/', 'BIM/')
            }
            if (item.dataSetType === 10) {
                item['levelPathName'] = item.levelPathName.replace('wmts/', 'WMTS/')
            }

            if (item.dataSetType === 0 && item.formatType === 1) {
                const findLastIndex = item.sceneNodeName.lastIndexOf('.')
                if (findLastIndex !== -1) {
                    item['nodeName'] = item.sceneNodeName.substring(0, findLastIndex)
                    item['sceneNodeName'] = item.nodeName
                } else {
                    item['nodeName'] = item.sceneNodeName
                }
            } else {
                item['nodeName'] = item.sceneNodeName
            }

            item['customNodeType'] = 'dataSet'
            item['nodeId'] = item.sceneNodeId


            if (item.viewStatus === 2) {
                item['disabled'] = true;
            }

            if (item.dataSetType === 0 && item.viewStatus !== 2) {
                item.subNodes.push({
                    nodeName: '',
                    nodeId: `emptyNode-${item.nodeId}`
                });
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
                    componentInfo.dataSetId = sceneInfo.componentTreeId;
                    componentInfo.elemId = Number(`${hostFileId}${instanceIndex}`);
                    item.elemId = componentInfo.elemId
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
                item.monomerRegNodeId = item.nodeId;
                item.monomerName = item.nodeName;
                item.monomerizationInfo = api.handle_formatMonomerInfo(item.monomerizationInfo);
                const monomerInfo = item.monomerizationInfo;
                if (monomerInfo.monomerizationType === 2) {
                    // 构建伪节点，用于展开单体化子节点
                    item.subNodes = [{ nodeId: `tempNode-${item.nodeId}`, nodeName: '', viewStatus: item.viewStatus }];
                }
            }

            // 视频投射类型
            if (item.dataSetType === 29 && item.projectionConfig) {
                item.customNodeType = 'projection'
                item.projectionId = item.dataSetId
                item.projectionName = item.nodeName
                item.projectionConfig.projectionId = item.dataSetId
                item.projectionConfig.projectionName = item.nodeName
            }
        });

        let folders = api.handle_findAllNodeByLevel(sceneData, 1);
        let allFolders = [...rootFolders, ...folders];
        allFolders.forEach((item) => {
            let rootNodeId = item.levelCode.split('/')[0]
            let find = rootFolders.find((el: any) => el.sceneNodeId === rootNodeId)
            item.dataSetType = find.dataSetType
            item.srcDataSetType = find.srcDataSetType
            item['nodeName'] = item.sceneNodeName
            item['nodeId'] = item.sceneNodeId
            if (item.componentSetInfo) {
                item.subEntities = item.subNodes
                item.subNodes = []
            }
        });

        // 隐藏没有数据的根节点
        sceneData = sceneData.filter((el: any) => el.subNodes.length);
        return sceneData;
    },

    // MARK data 查找-节点级别数据
    handle_findAllNodeByLevel: (nodeData: any, level: number) => {
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
    },

    // MARK data 格式化-单体化信息对象
    handle_formatMonomerInfo: (monomerInfo: any) => {
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
    },




}


export default api;