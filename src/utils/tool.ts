/*
 * @Author: Lemon C
 * @Date: 2024-09-23 14:42:45
 * @LastEditTime: 2026-01-16 09:49:01
 */


interface ApiMethods {
    data_deepClone(data: any): any;
}

const api: ApiMethods = {
    // MARK tool 深拷贝
    data_deepClone: (data: any): any => {
        var _obj = JSON.stringify(data); //  对象转成字符串
        var objClone = JSON.parse(_obj); //  字符串转成对象
        return objClone;
    },

}




export default api;