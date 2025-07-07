/*
 * @Author: Lemon C
 * @Date: 2022-11-08 11:58:14
 * @LastEditTime: 2025-07-07 14:34:41
 */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
const RE_ServerURl = "https://engine3.bjblackhole.com";

// 创建axios实例
const service: AxiosInstance = axios.create({
    baseURL: sessionStorage.getItem('RE_private_serverUrl') || RE_ServerURl,
    timeout: 30000,
});

// 请求拦截器：统一处理token
service.interceptors.request.use((config) => {
    const token = (window as any).$service.token || (window as any).$service.tokenId || '';
    config.headers = config.headers || {};
    config.headers.Authorization = token;
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
            let message = '未知错误!';

            if (status === 504 || status === 404) {
                message = '服务器错误，请稍候再试!';
            } else if (status === 403) {
                message = '权限不足,请联系管理员!';
            } else if (status === 401) {
                message = '登录信息已过期，请重新登录!';
            }

            console.log(message);
            console.log('请求日志:', JSON.stringify(err.response));
        }
        return Promise.reject(err);
    }
);

/**
 * token检查函数
 */
function checkToken() {
    const token = sessionStorage.getItem('RE_Token');
    if (!token || token.length <= 0) {
        console.log('链接无效，请联系管理员!');
        return false;
    }
    return true;
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

        service.post(`/blackHole3D/project${url}`, data)
            .then((response) => {
                let resData = response.data;
                if (resData.data && resData.data === '{}') {
                    resData.data = {};
                }
                resolve(resData);
            })
            .catch((err) => {
                reject(err);
            });
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

        service.get(`/blackHole3D/project${url}`, { params: data })
            .then((response) => {
                let resData = response.data;
                if (resData.data && resData.data === '{}') {
                    resData.data = {};
                }
                resolve(resData);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

// 导出axios实例（可选，用于特殊场景直接调用）
export { service };