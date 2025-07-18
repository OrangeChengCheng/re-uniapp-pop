/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2025-07-16 18:01:03
 */

import { useStateStore } from '@/stores/state';


interface ApiMethods {
    isInNativeApp(): any;
    getPlatform(): string;
    registerAppMsg(callback: Function): void;
    sendMsgWebToApp(data: any): void;
    getInitUrlParam(): any;
    webInit(): void;
    cloose(): void;
    popWebFull(data: any): void;
    setModelAlpha(data: any): void;
    setModelVisible(data: any): void;
    locDataSet(data: any): void;
    setCamLocTo(data: any): void;
    getCamLocInfo(): void;
    locElem(data: any): void;
    setModelColor(data: any): void;
    resetModelColor(data: any): void;
    clearModelSel(): void;
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
            onAppToWebMessage: callback,
        };
    },

    // MARK re-api 发送消息到原生应用
    sendMsgWebToApp: (data: any): void => {
        const platform = api.getPlatform();
        const messageString = typeof data === 'string' ? data : JSON.stringify(data);

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
                console.log('Web 环境下，模拟发送消息:', data);
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
            (window as any).$service.update_serverUrl(result.baseUrl);
            state_store.updateCurrBaseUrl(result.baseUrl);
        }
        if (result.token && result.token.length > 0) {
            (window as any).$service.update_token(result.token);
            state_store.updateCurrToken(result.token);
        }

        console.log('接收到的参数:', JSON.stringify(result));
        return result;
    },

    // MARK re-api Web初始化
    webInit: (): void => {
        let sendData: any = {
            type: 'webOnMounted',
            data: {},
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 关闭窗口
    cloose: (): void => {
        let sendData: any = {
            type: 'cloose',
            data: {},
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 关闭窗口
    popWebFull: (data: any): void => {
        let sendData: any = {
            type: 'popWebFull',
            data: {
                full: data
            },
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 设置模型构件透明度
    setModelAlpha: (data: any): void => {
        let sendData: any = {
            type: 'setModelAlpha',
            data: data,
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 设置模型构件显隐
    setModelVisible: (data: any): void => {
        let sendData: any = {
            type: 'setModelVisible',
            data: data,
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 相机定位数据集
    locDataSet: (data: any): void => {
        let sendData: any = {
            type: 'locDataSet',
            data: data,
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 相机定位目标
    setCamLocTo: (data: any): void => {
        let sendData: any = {
            type: 'setCamLocTo',
            data: data,
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 获取相机信息
    getCamLocInfo: (): void => {
        let sendData: any = {
            type: 'getCamLocInfo',
            data: {},
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 相机定位模型构件
    locElem: (data: any): void => {
        let sendData: any = {
            type: 'locElem',
            data: data,
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 设置模型构件颜色
    setModelColor: (data: any): void => {
        let sendData: any = {
            type: 'setModelColor',
            data: data,
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 重置模型构件颜色
    resetModelColor: (data: any): void => {
        let sendData: any = {
            type: 'resetModelColor',
            data: data,
        };
        api.sendMsgWebToApp(sendData);
    },

    // MARK re-api 清除所有选择集
    clearModelSel: (): void => {
        let sendData: any = {
            type: 'clearModelSel',
            data: {},
        };
        api.sendMsgWebToApp(sendData);
    },

}

export default api;