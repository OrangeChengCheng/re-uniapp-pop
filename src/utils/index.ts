/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-07-04 10:36:22
 */
import config from './config'
import reApi from './reApi'
import tool from './tool'



export default {
    install(app: any) {
        app.config.globalProperties.$service = {
            serverUrl: config.getServerUrl(),
            downloadUrl: config.getDownloadUrl(),
            commonTimeout: config.getTimeout(),
            update_serverUrl: config.updateServerUrl,
            get_serverUrl: config.getServerUrl,
        };

        (window as any).$reapi = {
            isInNativeApp: reApi.isInNativeApp,
            getPlatform: reApi.getPlatform,
            registerAppMsg: reApi.registerAppMsg,
            reSendMessageToApp: reApi.reSendMessageToApp,
            getInitUrlParam: reApi.getInitUrlParam,
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
        };
        (window as any).$tool = {
            url_handle: tool.url_handle,
            time_compare: tool.time_compare,
            cam_defauleDataSet: tool.cam_defauleDataSet,
        };
    }
}





