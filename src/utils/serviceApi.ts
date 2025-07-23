/*
 * @Author: Lemon C
 * @Date: 2025-07-21 10:25:29
 * @LastEditTime: 2025-07-22 12:25:08
 */
import { getSharedProjectSceneTree, getSharedProjectTree, getSharedProjectTreeSubNodesByLazy, getSharedProjectTreeSubNodes, getSharedProjectTreeChildrenByLazy, getSharedProjectTreeChildren } from '@/service/interface';

interface ApiMethods {
    getSharedProjectSceneTree(paran: any): Promise<any>;
    getSharedProjectTree(paran: any): Promise<any>;
    getSharedProjectTreeSubNodesByLazy(paran: any): Promise<any>;
    getSharedProjectTreeSubNodes(paran: any): Promise<any>;
    getSharedProjectTreeChildrenByLazy(paran: any): Promise<any>;
    getSharedProjectTreeChildren(paran: any): Promise<any>;
}

const api: ApiMethods = {
    // MARK 根据树id查询树
    getSharedProjectSceneTree: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectSceneTree(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

    // MARK 获取树目录
    getSharedProjectTree: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTree(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

    // MARK 请求模型目录树子节点-懒加载
    getSharedProjectTreeSubNodesByLazy: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTreeSubNodesByLazy(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

    // MARK 请求模型目录树子节点
    getSharedProjectTreeSubNodes: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTreeSubNodes(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

    // MARK 请求模型目录树下的构件ID-懒加载
    getSharedProjectTreeChildrenByLazy: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTreeChildrenByLazy(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

    // MARK 请求模型目录树下的构件ID
    getSharedProjectTreeChildren: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTreeChildren(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

}


export default api;


