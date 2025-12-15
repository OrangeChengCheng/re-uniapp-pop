/*
 * @Author: Lemon C
 * @Date: 2022-11-08 11:58:14
 * @LastEditTime: 2025-12-15 16:16:20
 */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { useStateStore } from '@/stores/state';
import { ElMessageBox as MessageBox } from 'element-plus';

const RE_ServerURl = "https://engine3.bjblackhole.com";
const RE_ServerRoute = "App3D";


// 创建axios实例, 这里静态创建不填写动态值
const service: AxiosInstance = axios.create({
    timeout: 30000,
});

// 请求拦截器：动态设置值，这里可以处理header
service.interceptors.request.use((config: any) => {
    const state_store = useStateStore();
    let baseUrl = state_store.baseUrl;
    if (baseUrl.includes("/BlackHole") || baseUrl.includes("/StarRiver")) {
        baseUrl = baseUrl.replace("/BlackHole", "").replace("/StarRiver", "");
    }
    config.baseURL = baseUrl || RE_ServerURl;
    const token = state_store.token || '';
    
    config.headers = config.headers || {};
    config.headers.Authorization = token;
    config.headers.App3D = true;
    return config;
});

// 响应拦截器：统一处理HTTP错误
service.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (err: AxiosError) => {
        if (err.response) {
            const { status } = err.response;
            handleError(status);
            console.log('请求日志:', JSON.stringify(err.response));
        }
        return Promise.reject(err);
    }
);

/**
 * token检查函数
 */
function checkToken() {
    const state_store = useStateStore();
    const token = state_store.token
    if (!token || token.length <= 0) {
        console.log('链接无效，请联系管理员!');
        return false;
    }
    return true;
}

/**
 * 处理异常
 */
function handleError(status: any): string {
    let message = '未知错误!';

    if (status === 504 || status === 404) {
        message = '服务器错误，请稍候再试!';
    } else if (status === 403) {
        message = '权限不足,请联系管理员!';
    } else if (status === 401) {
        message = '登录信息已过期，请重新登录!';
    }

    console.log(message);
    return message;
}

/**
 * app 原生请求
 */
function appRequest(type: string, resolve: any, reject: any, url: string, data?: object) {
    const NativeBridge = (window as any).$reapi;
    const state_store = useStateStore();
    let baseUrl = state_store.baseUrl;
    if (baseUrl.includes("/BlackHole") || baseUrl.includes("/StarRiver")) {
        baseUrl = baseUrl.replace("/BlackHole", "").replace("/StarRiver", "");
    }
    const fullUrl = `${baseUrl || RE_ServerURl}/${RE_ServerRoute}/project${url}`;
    const headers = [
        {
            key: 'Authorization',
            value: state_store.token || ''
        },
        {
            key: 'Content-Type',
            value: 'application/json'
        },
        {
            key: 'App3D',
            value: 'true'
        },
    ];
    NativeBridge.requestAppToWeb({ requestData: { param: data, url: fullUrl, headers: headers, type: type } })
        .then((response: any) => {
            let status = response.appStatus;
            alert(response);
            // MessageBox.alert('Hello world!');
            if (status == 200) {
                let resData = response.appResponse;
                if (resData.isSuccess) {
                    if (resData.data && resData.data === '{}') {
                        resData.data = {};
                    }
                    resolve(resData.data);
                } else {
                    resolve(null);
                }
            } else {
                // state_store.testMsg = handleError(status);
                resolve(null);
            }
        })
}


/**
 * POST请求封装（专注业务逻辑）
 */
export function requestPost(url: string, data?: object): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!checkToken()) {
            reject(new Error('Token无效'));
            return;
        }
        const NativeBridge = (window as any).$reapi;
        const platform = NativeBridge.getPlatform();
        if (platform == 'web') {
            service.post(`/${RE_ServerRoute}/project${url}`, data)
                .then((response: any) => {
                    let resData = response.data;
                    if (resData.isSuccess) {
                        if (resData.data && resData.data === '{}') {
                            resData.data = {};
                        }
                        resolve(resData.data);
                    } else {
                        resolve(null);
                    }
                })
                .catch((err: any) => {
                    reject(err);
                });
        } else {
            appRequest("POST", resolve, reject, url, data);
        }
    });
}

/**
 * GET请求封装（专注业务逻辑）
 */
export function requestGet(url: string, data?: object): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!checkToken()) {
            reject(new Error('Token无效'));
            return;
        }

        const NativeBridge = (window as any).$reapi;
        const platform = NativeBridge.getPlatform();
        if (platform == 'web') {
            service.get(`/${RE_ServerRoute}/project${url}`, { params: data })
                .then((response: any) => {
                    let resData = response.data;
                    if (resData.isSuccess) {
                        if (resData.data && resData.data === '{}') {
                            resData.data = {};
                        }
                        resolve(resData.data);
                    } else {
                        resolve(null);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        } else {
            appRequest("GET", resolve, reject, url, data);
        }
    });
}

// 导出axios实例（可选，用于特殊场景直接调用）
export { service };