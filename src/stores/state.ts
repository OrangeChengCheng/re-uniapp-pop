/*
 * @Author: Lemon C
 * @Date: 2024-11-09 10:46:29
 * @LastEditTime: 2025-07-16 17:48:31
 */
import { defineStore } from 'pinia'
import { getSharedExtrudeTexturesList } from '@/service/interface'

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
    baseUrl: String,
    token: String,
    appCurrSelElemId: Number,
}


export const useStateStore = defineStore('state', {
    state: (): StateMold => ({
        baseUrl: "",// app当前服务配置
        token: "",// app当前token
        appCurrSelElemId: 0,// app当前选择的构件id
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

        // MARK 更新当前选择的构件id
        updateCurrSelElemId(elemId: number) {
            this.appCurrSelElemId = elemId;
        },
    }
});