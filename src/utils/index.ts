/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-07-18 09:56:39
 */
import config from './config'
import reApi from './reApi'
import tool from './tool'
import { showLoading, hideLoading } from './loading'

export default {
    install(app: any) {
        (window as any).$service = {
            serverUrl: config.getServerUrl(),
            token: config.getToken(),
            downloadUrl: config.getDownloadUrl(),
            commonTimeout: config.getTimeout(),
            update_serverUrl: config.updateServerUrl,
            get_serverUrl: config.getServerUrl,
            update_token: config.updateToken,
            get_token: config.getToken,
        };

        (window as any).$reapi = {
            isInNativeApp: reApi.isInNativeApp,
            getPlatform: reApi.getPlatform,
            registerAppMsg: reApi.registerAppMsg,
            sendMsgWebToApp: reApi.sendMsgWebToApp,
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





