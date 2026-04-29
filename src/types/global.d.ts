/*
 * @Author: Lemon C
 * @Date: 2025-07-04 17:07:26
 * @LastEditTime: 2026-04-29 18:30:01
 */



declare global {
    interface Window {
        pcDebug: boolean;// 是否是pc调试模式
        isOffline: boolean;// 是否使用离线数据
        debugConsole: boolean;// 是否使用调试模式
        VConsole: new () => any;// 调试窗口
    }
}

export { };