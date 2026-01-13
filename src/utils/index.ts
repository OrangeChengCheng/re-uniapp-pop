/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-12-24 10:46:17
 */
import config from './config'
import reApi from './reApi'
import tool from './tool'
import serviceApi from './serviceApi'
import { showLoading, hideLoading } from './loading'

export default {
    install(app: any) {
        (window as any).$service = {
            getSharedSceneById: serviceApi.getSharedSceneById,
            getSharedProjectSceneTree: serviceApi.getSharedProjectSceneTree,
            getSharedProjectTree: serviceApi.getSharedProjectTree,
            getSharedProjectTreeSubNodesByLazy: serviceApi.getSharedProjectTreeSubNodesByLazy,
            getSharedProjectTreeSubNodes: serviceApi.getSharedProjectTreeSubNodes,
            getSharedProjectTreeChildrenByLazy: serviceApi.getSharedProjectTreeChildrenByLazy,
            getSharedProjectTreeChildren: serviceApi.getSharedProjectTreeChildren,
            isSharedRoomExistService: serviceApi.isSharedRoomExistService,
            getSharedRoomList: serviceApi.getSharedRoomList,
            getSharedRoomElement: serviceApi.getSharedRoomElement,
            getSharedRoomInfo: serviceApi.getSharedRoomInfo,
            getSharedBimElemTreeNodesByGroupService: serviceApi.getSharedBimElemTreeNodesByGroupService,
            getSharedBimElemIdsByGroupService: serviceApi.getSharedBimElemIdsByGroupService,
        };

        (window as any).$reapi = {
            isInNativeApp: reApi.isInNativeApp,
            getPlatform: reApi.getPlatform,
            registerAppMsg: reApi.registerAppMsg,
            requestAppToWeb: reApi.requestAppToWeb,
            logToApp: reApi.logToApp,
            getInitUrlParam: reApi.getInitUrlParam,
            webInit: reApi.webInit,
            cloose: reApi.cloose,
            popWebFull: reApi.popWebFull,
            setElemAlpha: reApi.setElemAlpha,
            setElemsValidState: reApi.setElemsValidState,
            setCamLocateToDataSet: reApi.setCamLocateToDataSet,
            setCamLocateTo: reApi.setCamLocateTo,
            setCamLocateToBound: reApi.setCamLocateToBound,
            getCamLocate: reApi.getCamLocate,
            setCamLocateToElem: reApi.setCamLocateToElem,
            setElemAttr: reApi.setElemAttr,
            resetElemAttr: reApi.resetElemAttr,
            delAllSelElems: reApi.delAllSelElems,
            addToSelElems: reApi.addToSelElems,
            setSelElemsAttr: reApi.setSelElemsAttr,
            setCamLocToWater: reApi.setCamLocToWater,
            setCamLocToExtrude: reApi.setCamLocToExtrude,
            getBIMDataSetBV: reApi.getBIMDataSetBV,
            getGridDataSetBV: reApi.getGridDataSetBV,
            getDataSetTerrId: reApi.getDataSetTerrId,
            getAllUnitNames: reApi.getAllUnitNames,
            waterVisible: reApi.waterVisible,
            extrudeVisible: reApi.extrudeVisible,
            setUnitActive: reApi.setUnitActive,
            setGridValidState: reApi.setGridValidState,
            getDataSetAllElemIDs: reApi.getDataSetAllElemIDs,
            setElemDepthBias: reApi.setElemDepthBias,
            setClipPlanesContourLineClr: reApi.setClipPlanesContourLineClr,
            setClipSpecifyHeight: reApi.setClipSpecifyHeight,
            endClip: reApi.endClip,
        };
        (window as any).$tool = {
            url_handle: tool.url_handle,
            time_compare: tool.time_compare,
            cam_defauleDataSet: tool.cam_defauleDataSet,
        };

        app.config.globalProperties.$showLoading = showLoading;
        app.config.globalProperties.$hideLoading = hideLoading;
    }
}





