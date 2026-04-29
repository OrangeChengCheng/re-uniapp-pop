/*
 * @Author: Lemon C
 * @Date: 2025-07-04 17:07:26
 * @LastEditTime: 2026-04-15 16:46:07
 */



declare global {
    interface Window {
        isOffline: boolean;// 是否使用离线数据
        VConsole: new () => any;// 调试窗口
    }
}

export { };