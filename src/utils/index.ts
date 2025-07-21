/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-07-21 14:30:32
 */
import config from './config'
import reApi from './reApi'
import tool from './tool'
import serviceApi from './serviceApi'
import { showLoading, hideLoading } from './loading'

export default {
    install(app: any) {
        (window as any).$service = {
            getSharedProjectTree: serviceApi.getSharedProjectTree,
            getSharedProjectTreeSubNodesByLazy: serviceApi.getSharedProjectTreeSubNodesByLazy,
            getSharedProjectTreeSubNodes: serviceApi.getSharedProjectTreeSubNodes,
            getSharedProjectTreeChildrenByLazy: serviceApi.getSharedProjectTreeChildrenByLazy,
            getSharedProjectTreeChildren: serviceApi.getSharedProjectTreeChildren,
        };

        (window as any).$reapi = {
            isInNativeApp: reApi.isInNativeApp,
            getPlatform: reApi.getPlatform,
            registerAppMsg: reApi.registerAppMsg,
            getInitUrlParam: reApi.getInitUrlParam,
            webInit: reApi.webInit,
            cloose: reApi.cloose,
            popWebFull: reApi.popWebFull,
            setModelAlpha: reApi.setModelAlpha,
            setModelVisible: reApi.setModelVisible,
            locDataSet: reApi.locDataSet,
            setCamLocTo: reApi.setCamLocTo,
            getCamLocInfo: reApi.getCamLocInfo,
            locElem: reApi.locElem,
            setModelColor: reApi.setModelColor,
            resetModelColor: reApi.resetModelColor,
            clearModelSel: reApi.clearModelSel,
            addToSel: reApi.addToSel,
            addToSelAttr: reApi.addToSelAttr,
            setCamLocToWater: reApi.setCamLocToWater,
            setCamLocToExtrude: reApi.setCamLocToExtrude,
            getDataSetBV: reApi.getDataSetBV,
            getGridDataSetBV: reApi.getGridDataSetBV,
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





