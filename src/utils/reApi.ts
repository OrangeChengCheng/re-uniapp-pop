/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2025-07-22 19:43:43
 */

import { useStateStore } from '@/stores/state';

// 消息格式定义
interface BridgeMsg {
    msgId: string;          // 唯一标识消息
    type: string;           // 操作类型
    data: any;              // 数据
    isResponse?: boolean;   // 是否为响应消息
}

// 存储消息回调的 Map
const BridgeMsgCallbackList = new Map<string, Function>();


interface ApiMethods {
    isInNativeApp(): any;
    getPlatform(): string;
    registerAppMsg(callback: Function): void;
    sendMsgWebToApp(type: string, data?: any, callback?: Function): void;
    getInitUrlParam(): any;
    webInit(): void;
    cloose(): void;
    popWebFull(data: any): void;
    setModelAlpha(data: any): void;
    setModelVisible(data: any): void;
    locDataSet(data: any): void;
    setCamLocTo(data: any): void;
    setCamLocToBound(data: any): void;
    getCamLocInfo(): void;
    locElem(data: any): void;
    setModelColor(data: any): void;
    resetElemAttr(data: any): void;
    delAllSelElems(): void;
    addToSel(data: any): void;
    setSelElemsAttr(data: any): void;
    setCamLocToWater(data: any): void;
    setCamLocToExtrude(data: any): void;
    getBIMDataSetBV(data: any): Promise<any>;
    getGridDataSetBV(data: any): Promise<any>;
    getTerrId(data: any): Promise<any>;
    getAllUnitNames(data: any): Promise<any>;
    waterVisible(data: any): void;
    extrudeVisible(data: any): void;
    setUnitActive(data: any): void;
    setGridValidState(data: any): void;
}

const api: ApiMethods = {
    // MARK re-api 判断是否在原生应用中运行
    isInNativeApp: (): any => {
        return (window as any).webkit || (window as any).REMobileApp;
    },

    // MARK re-api 判断平台类型
    getPlatform: (): string => {
        if ((window as any).webkit && (window as any).webkit.messageHandlers && (window as any).webkit.messageHandlers.REMobileApp) {
            return 'ios';
        } else if ((window as any).REMobileApp) {
            return 'android';
        }
        return 'web';
    },

    // MARK re-api 注册 app 发送消息回调
    registerAppMsg: (callback: Function): void => {
        if (!callback || typeof callback !== 'function') {
            console.error('registerAppMsg: 必须提供有效的回调函数');
            return;
        }
        // 初始化：将回调函数挂载到 window 对象上，供 移动端 调用
        (window as any).REWebApp = {
            onAppToWebMessage: (msg: string) => {
                const bridgeMsg: BridgeMsg = JSON.parse(msg);
                if (bridgeMsg.isResponse && bridgeMsg.msgId) {
                    // 如果是响应消息，查找对应的回调函数
                    const bridgeCallback = BridgeMsgCallbackList.get(bridgeMsg.msgId);
                    if (bridgeCallback) {
                        bridgeCallback(bridgeMsg.data);
                        BridgeMsgCallbackList.delete(bridgeMsg.msgId); // 执行后删除回调
                    }
                } else {
                    callback(msg);
                }
            },
        };
    },

    // MARK re-api 发送消息到原生应用
    sendMsgWebToApp: (type: string, data?: any, callback?: Function): void => {
        const msgId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const bridgeMsg: BridgeMsg = {
            msgId: msgId,
            type: type,
            data: data ? data : {},
            isResponse: false
        };

        if (callback) {
            BridgeMsgCallbackList.set(msgId, callback);
        }

        const platform = api.getPlatform();
        const messageString = JSON.stringify(bridgeMsg);

        console.log(`向 ${platform} 发送消息:`, messageString);

        switch (platform) {
            case 'ios':
                // iOS 通信
                (window as any).webkit.messageHandlers.REMobileApp.postMessage(messageString); // iOS统一调用此方法发送信息
                break;

            case 'android':
                // Android 通信
                (window as any).REMobileApp.sendMsgWebToApp(messageString); // Android可以注册多个方法供Web调用
                break;

            case 'web':
                // Web 环境下的处理（可用于调试）
                console.log('Web 环境下，模拟发送消息:', bridgeMsg);
                break;
        }
    },

    // MARK re-api 接收初始化参数
    getInitUrlParam: (): any => {
        const fullUrl = window.location.href;
        let queryString = '';
        console.log('接收到的请求链接:', fullUrl);

        if (window.location.search) {
            queryString = window.location.search.substring(1);
        } else if (fullUrl.includes('#')) {
            const hashPart = fullUrl.split('#')[1];
            if (hashPart && hashPart.includes('?')) {
                queryString = hashPart.split('?')[1];
            }
        }
        const params = new URLSearchParams(queryString);
        const result: any = {};
        params.forEach((value, key) => {
            result[key] = value;
        });
        //更新基础配置
        const state_store = useStateStore();
        if (result.baseUrl && result.baseUrl.length > 0) {
            state_store.updateCurrBaseUrl(result.baseUrl);
        }

        if (result.token && result.token.length > 0) {
            state_store.updateCurrToken(result.token);
        }

        if (result.shareType && result.shareType.length > 0) {
            state_store.updateCurrShareType(Number(result.shareType));
        }

        if (result.sceneId && result.sceneId.length > 0) {
            state_store.updateCurrSceneId(result.sceneId);
        }

        console.log('接收到的参数:', JSON.stringify(result));
        return result;
    },

    // MARK re-api Web初始化
    webInit: (): void => {
        api.sendMsgWebToApp('webOnMounted');
    },

    // MARK re-api 关闭窗口
    cloose: (): void => {
        api.sendMsgWebToApp("cloose");
    },

    // MARK re-api 关闭窗口
    popWebFull: (data: any): void => {
        let sendData: any = {
            full: data
        };
        api.sendMsgWebToApp("popWebFull", sendData);
    },

    // MARK re-api 设置模型构件透明度
    setModelAlpha: (data: any): void => {
        api.sendMsgWebToApp('setModelAlpha', data);
    },

    // MARK re-api 设置模型构件显隐
    setModelVisible: (data: any): void => {
        api.sendMsgWebToApp('setModelVisible', data);
    },

    // MARK re-api 相机定位数据集
    locDataSet: (data: any): void => {
        api.sendMsgWebToApp('locDataSet', data);
    },

    // MARK re-api 相机定位目标
    setCamLocTo: (data: any): void => {
        api.sendMsgWebToApp('setCamLocTo', data);
    },

    // MARK re-api 相机定位包围盒
    setCamLocToBound: (data: any): void => {
        api.sendMsgWebToApp('setCamLocToBound', data);
    },

    // MARK re-api 获取相机信息
    getCamLocInfo: (): void => {
        api.sendMsgWebToApp('getCamLocInfo');
    },

    // MARK re-api 相机定位模型构件
    locElem: (data: any): void => {
        api.sendMsgWebToApp('locElem', data);
    },

    // MARK re-api 设置模型构件颜色
    setModelColor: (data: any): void => {
        api.sendMsgWebToApp('setModelColor', data);
    },

    // MARK re-api 重置模型构件颜色
    resetElemAttr: (data: any): void => {
        api.sendMsgWebToApp('resetElemAttr', data);
    },

    // MARK re-api 清除所有选择集
    delAllSelElems: (): void => {
        api.sendMsgWebToApp('delAllSelElems');
    },

    // MARK re-api 添加到选择集
    addToSel: (data: any): void => {
        api.sendMsgWebToApp('addToSel', data);
    },

    // MARK re-api 设置选择集属性
    setSelElemsAttr: (data: any): void => {
        api.sendMsgWebToApp('setSelElemsAttr', data);
    },

    // MARK re-api 相机定位水面
    setCamLocToWater: (data: any): void => {
        api.sendMsgWebToApp('setCamLocToWater', data);
    },

    // MARK re-api 相机定位挤出
    setCamLocToExtrude: (data: any): void => {
        api.sendMsgWebToApp('setCamLocToExtrude', data);
    },

    // MARK re-api 获取数据集总包围盒信息
    getBIMDataSetBV: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('getBIMDataSetBV', data, (response: any) => {
                resolve(response);
            });
        });
    },

    // MARK re-api 获取Grid数据集总包围盒信息
    getGridDataSetBV: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('getGridDataSetBV', data, (response: any) => {
                resolve(response);
            });
        });
    },

    // MARK re-api 获取全局地形实例标识
    getTerrId: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('getTerrId', data, (response: any) => {
                resolve(response);
            });
        });
    },

    // MARK re-api 获取所有的地形数据层单元名称
    getAllUnitNames: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('getAllUnitNames', data, (response: any) => {
                resolve(response);
            });
        });
    },

    // MARK re-api 层单元的激活状态
    setUnitActive: (data: any): void => {
        api.sendMsgWebToApp('setUnitActive', data);
    },

    // MARK re-api 设置瓦片的有效性
    setGridValidState: (data: any): void => {
        api.sendMsgWebToApp('setGridValidState', data);
    },

    // MARK re-api 水面显隐
    waterVisible: (data: any): void => {
        api.sendMsgWebToApp('waterVisible', data);
    },

    // MARK re-api 挤出显隐
    extrudeVisible: (data: any): void => {
        api.sendMsgWebToApp('extrudeVisible', data);
    },

}

export default api;