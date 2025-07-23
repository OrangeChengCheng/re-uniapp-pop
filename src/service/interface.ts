/*
 * @Author: Lemon C
 * @Date: 2024-04-19 12:22:25
 * @LastEditTime: 2025-07-22 14:35:00
 */
import { requestPost, requestGet } from '@/service/request';





// MOD-- 目录树 相关

// 根据树id查询树
export function getSharedProjectSceneTree(data: any) {
    return requestPost('/sceneTree/v3/getTreeById', data);
}

// 获取模型目录树
export function getSharedProjectTree(data: any) {
    return requestPost('/dataSet/v3/dataSetRootNodes', data);
}

// 请求模型目录树子节点-懒加载
export function getSharedProjectTreeSubNodesByLazy(data: any) {
    return requestPost('/dataSet/v3/dataSetFileTreeNodes/lazy', data);
}

// 请求模型目录树子节点
export function getSharedProjectTreeSubNodes(data: any) {
    return requestPost('/dataSet/v3/dataSetFileTreeNodes', data);
}

// 请求模型目录树下的构件ID-懒加载
export function getSharedProjectTreeChildrenByLazy(data: any) {
    return requestPost('/element/v3/getTreeChildren/lazy', data);
}

// 请求模型目录树下的构件ID
export function getSharedProjectTreeChildren(data: any) {
    return requestPost('/element/v3/getTreeChildren', data);
}



// MOD-- 属性 相关
// 查询模型属性
export function getSharedProjectParam(data: any) {
    return requestPost('/element/v3/getElementParam', data);
}

// 获取矢量属性信息
export function getSharedVectorParam(data: any) {
    return requestPost('/element/v3/getVectorParam', data);
}

// 查询构件属性类型
export function getElemParamTypeService(data: any) {
    return requestPost('/componentLibrary/v3/getComponentParamTypes', data);
}

// 查询构件属性
export function getElemParamService(data: any) {
    return requestPost('/componentLibrary/v3/getComponentProperty', data);
}