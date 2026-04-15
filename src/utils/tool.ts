/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2026-04-14 16:22:47
 */


interface ApiMethods {
    toPromise<T = any>(fn: (callback: (res: any) => void) => void): Promise<T>;
    data_deepClone(data: any): any;
}

const api: ApiMethods = {
    // ============================
    // 万能：回调转 Promise
    // 所有 带有回调性质的函数都能封装
    // ============================
    toPromise<T = any>(fn: (callback: (res: any) => void) => void): Promise<T> {
        return new Promise((resolve) => {
            fn((res: any) => resolve(res));
        });
    },

    // MARK tool 深拷贝
    data_deepClone: (data: any): any => {
        var _obj = JSON.stringify(data); //  对象转成字符串
        var objClone = JSON.parse(_obj); //  字符串转成对象
        return objClone;
    },

}




export default api;