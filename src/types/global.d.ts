/*
 * @Author: Lemon C
 * @Date: 2024-09-13 18:01:53
 * @LastEditTime: 2025-07-03 11:29:36
 */


// 定义 re 对象的类型
interface Re {
    $u: {
        toast(title: string): void;
    }
    $re: {
        unipluginLog(log: string): void;
        realEngineRender(data: any): Promise<any>;
        reAppToUniMessageHandler(onCallBack: (data: any) => void): Promise<void>;
        reUniPostData(data: any): void;
    }
    $window: {
        serverUrl: string,
        downloadUrl: string,
        commonTimeout: number,
    };
    $tool: {
        url_handle(utl: string): any;
        time_compare(frontTime: Date, backTime: Date): string;
        cam_defauleDataSet(dataSetList: any): string;
    };
    update_serverUrl(url: string): void;
    get_serverUrl(): string;
}

// 扩展全局 window 对象，添加 re 属性
declare global {
    interface Window {
        re: Re;
    }
}



