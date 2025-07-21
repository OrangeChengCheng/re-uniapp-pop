/*
 * @Author: Lemon C
 * @Date: 2025-07-21 10:25:29
 * @LastEditTime: 2025-07-21 11:57:59
 */
import { getSharedProjectTree, getSharedProjectTreeSubNodesByLazy, getSharedProjectTreeSubNodes, getSharedProjectTreeChildrenByLazy, getSharedProjectTreeChildren } from '@/service/interface';

interface ApiMethods {
    getSharedProjectTree(paran: any): Promise<any>;
    getSharedProjectTreeSubNodesByLazy(paran: any): Promise<any>;
    getSharedProjectTreeSubNodes(paran: any): Promise<any>;
    getSharedProjectTreeChildrenByLazy(paran: any): Promise<any>;
    getSharedProjectTreeChildren(paran: any): Promise<any>;
}

const api: ApiMethods = {
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


