/*
 * @Author: Lemon C
 * @Date: 2024-09-14 14:22:08
 * @LastEditTime: 2025-07-03 17:31:16
 */


interface ApiMethods {
    isInNativeApp(): any;
    getPlatform(): string;
    registerAppMsg(callback: Function): void;
    reSendMessageToApp(data: any): void;
    getInitUrlParam(): any;
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
    reSendMessageToApp: (data: any): void => {
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
                (window as any).REMobileApp.reSendMessageToApp(messageString); // Android可以注册多个方法供Web调用
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
        console.log('接收到的参数:', JSON.stringify(result));
        return result;
    },

    // MARK re-api 关闭窗口
    cloose: (): void => {
        let sendData: any = {
            type: 'cloose',
            data: {},
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 关闭窗口
    popWebFull: (data: any): void => {
        let sendData: any = {
            type: 'popWebFull',
            data: {
                full: data
            },
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 设置模型构件透明度
    setModelAlpha: (data: any): void => {
        let sendData: any = {
            type: 'setModelAlpha',
            data: data,
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 设置模型构件显隐
    setModelVisible: (data: any): void => {
        let sendData: any = {
            type: 'setModelVisible',
            data: data,
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 相机定位数据集
    locDataSet: (data: any): void => {
        let sendData: any = {
            type: 'locDataSet',
            data: data,
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 相机定位目标
    setCamLocTo: (data: any): void => {
        let sendData: any = {
            type: 'setCamLocTo',
            data: data,
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 获取相机信息
    getCamLocInfo: (): void => {
        let sendData: any = {
            type: 'getCamLocInfo',
            data: {},
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 相机定位模型构件
    locElem: (data: any): void => {
        let sendData: any = {
            type: 'locElem',
            data: data,
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 设置模型构件颜色
    setModelColor: (data: any): void => {
        let sendData: any = {
            type: 'setModelColor',
            data: data,
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 重置模型构件颜色
    resetModelColor: (data: any): void => {
        let sendData: any = {
            type: 'resetModelColor',
            data: data,
        };
        api.reSendMessageToApp(sendData);
    },

    // MARK re-api 清除所有选择集
    clearModelSel: (): void => {
        let sendData: any = {
            type: 'clearModelSel',
            data: {},
        };
        api.reSendMessageToApp(sendData);
    },

}

export default api;