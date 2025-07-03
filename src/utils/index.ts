/*
 * @Author: Lemon C
 * @Date: 2024-09-14 10:05:14
 * @LastEditTime: 2025-07-01 18:07:32
 */
import config from './config'
import reApi from './reApi'
// import uniApi from './uniApi'
import tool from './tool'


function toast(title: string) {
    console.log("---------------------");
    console.log(title);
    console.log("---------------------");

}

// 定义全局的 re 对象
const re: any = {};

export default {
    install() {
        if (!re || typeof re !== 'object') {
            return;
        }
        re.$u = {
            toast,
        };
        re.$window = {
            serverUrl: config.getServerUrl(),
            downloadUrl: config.getDownloadUrl(),
            commonTimeout: config.getTimeout(),
        };
        re.$re = {
            unipluginLog: reApi.unipluginLog,
            realEngineRender: reApi.realEngineRender,
            reAppToUniMessageHandler: reApi.reAppToUniMessageHandler,
            reUniPostData: reApi.reUniPostData,
        };
        re.$tool = {
            url_handle: tool.url_handle,
            time_compare: tool.time_compare,
            cam_defauleDataSet: tool.cam_defauleDataSet,
        };
        re.update_serverUrl = config.updateServerUrl;
        re.get_serverUrl = config.getServerUrl;
    }
}