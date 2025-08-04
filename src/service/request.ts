/*
 * @Author: Lemon C
 * @Date: 2022-11-08 11:58:14
 * @LastEditTime: 2025-08-04 17:34:12
 */
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { useStateStore } from '@/stores/state';


const RE_ServerURl = "https://engine3.bjblackhole.com";
const RE_ServerRoute = "App3D";


// 创建axios实例, 这里静态创建不填写动态值
const service: AxiosInstance = axios.create({
    timeout: 30000,
});

// 请求拦截器：动态设置值，这里可以处理header
service.interceptors.request.use((config: any) => {
    const state_store = useStateStore();
    const token = state_store.token || '';
    config.baseURL = state_store.baseUrl || RE_ServerURl;

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
    const state_store = useStateStore();
    const token = state_store.token
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

        service.post(`/${RE_ServerRoute}/project${url}`, data)
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

        service.get(`/${RE_ServerRoute}/project${url}`, { params: data })
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