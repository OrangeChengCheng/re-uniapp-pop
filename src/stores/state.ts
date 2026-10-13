/*
 * @Author: Lemon C
 * @Date: 2024-11-09 10:46:29
 * @LastEditTime: 2026-10-10 11:57:05
 */
import { defineStore } from 'pinia'

/**
    0 BIM模型
    10 WMTS地图服务
    11 倾斜摄影
    13 遥感影像
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
    24 挤出
    25 单体化
    29 视频投射
    31 高斯泼溅
*/

interface StateMold {
    filePath: string,
    baseUrl: string,
    token: string,
    shareType: number,
    sceneId: string,
    webPopId: string,
    modelTypeList: any,
    notModelTypeList: any,
    testMsg: string,
}


export const useStateStore = defineStore('state', {
    state: (): StateMold => ({
        filePath: "",// 离线查看模式下文件地址
        baseUrl: "",// app当前服务配置
        token: "",// app当前token
        shareType: 0,// 0：无 1：模型 2：场景
        sceneId: "",// app当前场景id，shareType=1代表数据集id  shareType=2代表场景id
        webPopId: "",// 当前web弹窗id
        modelTypeList: [0, 10, 11, 13, 14, 15, 16, 20, 21, 22],// 模型加载类型的数据集
        notModelTypeList: [23, 24, 25],// 非模型加载类型的数据集
        testMsg: "",// 测试信息
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

        // MARK 更新当前的webPopId
        updateCurrWebPopId(webPopId: string) {
            this.webPopId = webPopId;
        },

        // MARK 更新当前的filePath
        updateCurrFilePath(filePath: string) {
            this.filePath = filePath;
        },

    }
});