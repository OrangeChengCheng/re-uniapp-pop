/*
 * @Author: Lemon C
 * @Date: 2024-11-09 10:46:29
 * @LastEditTime: 2025-08-04 17:35:22
 */
import { defineStore } from 'pinia'

/**
    0 BIM模型
    13 遥感影像
    10 WMTS地图服务
    11 倾斜摄影
    14 360全景图
    15 点云
    16 二维图纸
    17 公共构件
    18 我的构件
    19 发布后的构件(场景发布)
    20 矢量
    21 场景CAD
    22 场景矢量
    23 水面
*/

interface StateMold {
    pcDebug: boolean,
    baseUrl: string,
    token: string,
    shareType: number,
    sceneId: string,
}


export const useStateStore = defineStore('state', {
    state: (): StateMold => ({
        pcDebug: false,// pc端调试
        baseUrl: "",// app当前服务配置
        token: "",// app当前token
        shareType: 0,// 0：无 1：模型 2：场景
        sceneId: "",// app当前场景id，shareType=1代表数据集id  shareType=2代表场景id
    }),
    actions: {

        // MARK 更新当前的服务配置
        updateCurrBaseUrl(baseUrl: string) {
            this.baseUrl = baseUrl;
        },

        // MARK 更新当前的token
        updateCurrToken(token: string) {
            this.token = token;
        },

        // MARK 更新当前的shareType
        updateCurrShareType(shareType: number) {
            this.shareType = shareType;
        },

        // MARK 更新当前的sceneId
        updateCurrSceneId(sceneId: string) {
            this.sceneId = sceneId;
        },

    }
});