/*
 * @Author: Lemon C
 * @Date: 2026-10-08 14:15:52
 * @LastEditTime: 2026-10-12 16:47:45
 */
import dataTool from '@/utils/dataTool';









interface ApiMethods {
    getEntitySetNodes(treeData: any): any;
    getEntityNodes(treeData: any): any;
    getEntityElems(entityNodes: any, isSceneEditMode: boolean): any;
}


const api: ApiMethods = {

    getEntitySetNodes: (treeData: any): any => {
        const folderNodes = dataTool.handle_findAllNodeByLevel(treeData, 1);
        const entitySetNodes = folderNodes.filter((el: any) => el.dataSetType === 19 && el.componentSetInfo);
        return entitySetNodes;
    },

    getEntityNodes: (treeData: any): any => {
        const entitySetNodes = api.getEntitySetNodes(treeData);
        const leafNodes = dataTool.handle_findAllNodeByLevel(treeData, 2);
        const entityNodes: any = [];
        entitySetNodes.forEach((item: any) => {
            entityNodes.push(...item.subEntities);
        })
        leafNodes.forEach((item: any) => {
            if (item.dataSetType === 19) {
                entityNodes.push(item);
            }
        })
        return entityNodes;
    },

    getEntityElems: (entityNodes: any, isSceneEditMode: boolean): any => {
        const entityElems: any = []
        entityNodes.forEach((item: any) => {
            let dataSetId = '';
            if (isSceneEditMode) {
                dataSetId = item.srcDataSetId;
            } else {
                const componentInfo = item.componentInfo;
                dataSetId = componentInfo.dataSetId;
            }

            const find = entityElems.find((el: any) => el.dataSetId === dataSetId);
            if (find) {
                find.elemIdList.push(item.elemId);
            } else {
                const obj = {
                    dataSetId,
                    elemIdList: [item.elemId]
                }
                entityElems.push(obj)
            }
        })
        return entityElems;
    }
}



export default api;