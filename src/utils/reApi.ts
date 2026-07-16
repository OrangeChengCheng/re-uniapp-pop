/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2026-07-16 10:28:44
 */

import { useStateStore } from '@/stores/state';

// 消息格式定义
interface BridgeMsg {
    msgId: string;          // 唯一标识消息
    type: string;           // 操作类型
    data: any;              // 数据
    isResponse?: boolean;   // 是否为响应消息
    webPopId?: string;      // web弹窗标识
}

// 存储消息回调的 Map
const BridgeMsgCallbackList = new Map<string, Function>();


interface ApiMethods {
    isInNativeApp(): any;
    getPlatform(): string;
    registerAppMsg(callback: Function): void;
    sendMsgWebToApp(type: string, data?: any, callback?: Function, nolog?: boolean): void;
    requestAppToWeb(data: any): Promise<any>;
    logToApp(data: any): void;
    updateTreeData(data: any): void;
    getInitUrlParam(): any;
    webInit(): void;
    cloose(data: any): void;
    popWebFull(data: any): void;
    
    fileGetAllChild(data: any): Promise<any>;
    fileGetChildBySuffix(data: any): Promise<any>;
    dbQuery(data: any): Promise<any>;
    dbTableExist(data: any): Promise<any>;

    setElemAlpha(data: any): void;
    setElemsValidState(data: any): void;
    setCamLocateToDataSet(data: any): void;
    setCamLocateTo(data: any): void;
    setCamLocateToBound(data: any): void;
    getCamLocate(): Promise<any>;
    setCamLocateToElem(data: any): void;
    setElemAttr(data: any): void;
    resetElemAttr(data: any): void;
    delAllSelElems(): void;
    addToSelElems(data: any): void;
    setSelElemsAttr(data: any): void;
    setCamLocToWater(data: any): void;
    setCamLocToExtrude(data: any): void;
    setCamLocToMonomer(data: any): void;
    addToSelMonomer(data: any): void;
    delFromSelMonomer(data: any): void;
    setMonomerSelAttr(data: any): void;
    getMonomerSelAttr(data: any): Promise<any>;
    getBIMDataSetBV(data: any): Promise<any>;
    getGridDataSetBV(data: any): Promise<any>;
    getDataSetTerrId(data: any): Promise<any>;
    getAllUnitNames(data: any): Promise<any>;
    waterVisible(data: any): void;
    extrudeVisible(data: any): void;
    monomerVisible(data: any): void;
    projectionVisible(data: any): void;
    setUnitActive(data: any): void;
    setGridValidState(data: any): void;
    getDataSetAllElemIDs(data: any): Promise<any>;
    setElemDepthBias(data: any): void;
    setClipPlanesContourLineClr(data: any): void;
    setClipSpecifyHeight(data: any): void;
    endClip(): void;
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
    sendMsgWebToApp: (type: string, data?: any, callback?: Function, nolog?: boolean): void => {
        const msgId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const state_store = useStateStore();
        const bridgeMsg: BridgeMsg = {
            msgId: msgId,
            type: type,
            data: data ? data : {},
            isResponse: false,
            webPopId: state_store.webPopId,
        };

        if (callback) {
            BridgeMsgCallbackList.set(msgId, callback);
        }

        const platform = api.getPlatform();
        const messageString = JSON.stringify(bridgeMsg);

        if (!nolog) console.log(`向 ${platform} 发送消息:`, messageString);

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
                if (!nolog) console.log('Web 环境下，模拟发送消息:', bridgeMsg);
                break;
        }
    },

    // MARK re-api 由web提供参数，app发起请求获取数据返还web
    requestAppToWeb: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('requestAppToWeb', data, (response: any) => {
                resolve(response);
            });
        });
    },

    logToApp: (data: any): void => {
        api.sendMsgWebToApp("log", { log: data });
    },

    // MARK re-api 更新目录树数据
    updateTreeData: (data: any): void => {
        // api.sendMsgWebToApp("updateTreeData", data, undefined, true);
        api.sendMsgWebToApp("updateTreeData", data);
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
            // URL 解码，跳过系统限制的 HTTPS/HTTP 混合
            // const baseUrl = decodeURIComponent(result.baseUrl);
            // state_store.updateCurrBaseUrl(baseUrl);
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

        if (result.webPopId && result.webPopId.length > 0) {
            state_store.updateCurrWebPopId(result.webPopId);
        }

        if (result.filePath && result.filePath.length > 0) {
            console.log('文件路径:', result.filePath);
            state_store.updateCurrFilePath(result.filePath);
        }

        console.log('接收到的参数:', JSON.stringify(result));
        return result;
    },

    // MARK re-api Web初始化
    webInit: (): void => {
        api.sendMsgWebToApp('webOnMounted');
    },

    // MARK re-api 关闭窗口
    cloose: (data: any): void => {
        api.sendMsgWebToApp("cloose", data);
    },

    // MARK re-api 关闭窗口
    popWebFull: (data: any): void => {
        api.sendMsgWebToApp("popWebFull", data);
    },


    // MOD-- 数据库模块 <---
    
    // MARK app-db 数据库查询
    dbQuery: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('dbQuery', data, (response: any) => {
                resolve(response);
            });
        });
    },
    
    // MARK app-db 查询表是否存在
    dbTableExist: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('dbTableExist', data, (response: any) => {
                resolve(response);
            });
        });
    },


    // MOD-- 文件模块 <---

    // MARK app-file 获取指定文件夹下所有文件列表
    fileGetAllChild: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('fileGetAllChild', data, (response: any) => {
                resolve(response);
            });
        });
    },

    // MARK app-file 获取文件夹内指定后缀的文件列表
    fileGetChildBySuffix: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('fileGetChildBySuffix', data, (response: any) => {
                resolve(response);
            });
        });
    },


    // MOD-- 引擎模块 <---

    // MARK re-api 设置模型构件透明度
    setElemAlpha: (data: any): void => {
        api.sendMsgWebToApp('setElemAlpha', data);
    },

    // MARK re-api 设置模型构件显隐
    setElemsValidState: (data: any): void => {
        api.sendMsgWebToApp('setElemsValidState', data);
    },

    // MARK re-api 相机定位数据集
    setCamLocateToDataSet: (data: any): void => {
        api.sendMsgWebToApp('setCamLocateToDataSet', data);
    },

    // MARK re-api 相机定位目标
    setCamLocateTo: (data: any): void => {
        api.sendMsgWebToApp('setCamLocateTo', data);
    },

    // MARK re-api 相机定位包围盒
    setCamLocateToBound: (data: any): void => {
        api.sendMsgWebToApp('setCamLocateToBound', data);
    },

    // MARK re-api 获取相机信息
    getCamLocate: (): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('getCamLocate', null, (response: any) => {
                resolve(response);
            });
        });
    },

    // MARK re-api 相机定位模型构件
    setCamLocateToElem: (data: any): void => {
        api.sendMsgWebToApp('setCamLocateToElem', data);
    },

    // MARK re-api 设置模型构件颜色
    setElemAttr: (data: any): void => {
        api.sendMsgWebToApp('setElemAttr', data);
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
    addToSelElems: (data: any): void => {
        api.sendMsgWebToApp('addToSelElems', data);
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

    // MARK re-api 相机定位单体化
    setCamLocToMonomer: (data: any): void => {
        api.sendMsgWebToApp('setCamLocToMonomer', data);
    },

    // MARK re-api 添加单体化到选择集
    addToSelMonomer: (data: any): void => {
        api.sendMsgWebToApp('addToSelMonomer', data);
    },

    // MARK re-api 从单体化选择集中删除
    delFromSelMonomer: (data: any): void => {
        api.sendMsgWebToApp('delFromSelMonomer', data);
    },

    // MARK re-api 设置单体化选择集属性信息
    setMonomerSelAttr: (data: any): void => {
        api.sendMsgWebToApp('setMonomerSelAttr', data);
    },

    // MARK re-api 获取单体化选择集属性信息
    getMonomerSelAttr: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('getMonomerSelAttr', data, (response: any) => {
                resolve(response);
            });
        });
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
    getDataSetTerrId: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('getDataSetTerrId', data, (response: any) => {
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

    // MARK re-api 单体化显隐
    monomerVisible: (data: any): void => {
        api.sendMsgWebToApp('monomerVisible', data);
    },

    // MARK re-api 视频投射显隐
    projectionVisible: (data: any): void => {
        api.sendMsgWebToApp('projectionVisible', data);
    },

    // MARK re-api 获取某一个数据集的可见的元素id集合
    getDataSetAllElemIDs: (data: any): Promise<any> => {
        return new Promise((resolve) => {
            api.sendMsgWebToApp('getDataSetAllElemIDs', data, (response: any) => {
                resolve(response);
            });
        });
    },

    // MARK re-api 设置模型的深度偏移值
    setElemDepthBias: (data: any): void => {
        api.sendMsgWebToApp('setElemDepthBias', data);
    },

    // MARK re-api 设置剖切面与模型相交的轮廓线颜色
    setClipPlanesContourLineClr: (data: any): void => {
        api.sendMsgWebToApp('setClipPlanesContourLineClr', data);
    },

    // MARK re-api 根据指定高度进行单双面剖切
    setClipSpecifyHeight: (data: any): void => {
        api.sendMsgWebToApp('setClipSpecifyHeight', data);
    },

    // MARK re-api 退出剖切状态
    endClip: (): void => {
        api.sendMsgWebToApp('endClip');
    },

}

export default api;