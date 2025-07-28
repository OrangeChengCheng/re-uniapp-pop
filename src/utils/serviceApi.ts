/*
 * @Author: Lemon C
 * @Date: 2025-07-21 10:25:29
 * @LastEditTime: 2025-07-24 16:38:14
 */
import {
    getSharedProjectSceneTree,
    getSharedProjectTree,
    getSharedProjectTreeSubNodesByLazy,
    getSharedProjectTreeSubNodes,
    getSharedProjectTreeChildrenByLazy,
    getSharedProjectTreeChildren,
    isSharedRoomExistService,
    getSharedRoomList,
    getSharedRoomElement,
    getSharedRoomInfo,
} from '@/service/interface';

interface ApiMethods {
    getSharedProjectSceneTree(paran: any): Promise<any>;
    getSharedProjectTree(paran: any): Promise<any>;
    getSharedProjectTreeSubNodesByLazy(paran: any): Promise<any>;
    getSharedProjectTreeSubNodes(paran: any): Promise<any>;
    getSharedProjectTreeChildrenByLazy(paran: any): Promise<any>;
    getSharedProjectTreeChildren(paran: any): Promise<any>;
    isSharedRoomExistService(paran: any): Promise<any>;
    getSharedRoomList(paran: any): Promise<any>;
    getSharedRoomElement(paran: any): Promise<any>;
    getSharedRoomInfo(paran: any): Promise<any>;
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

    // MARK 是否具有空间信息
    isSharedRoomExistService: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            isSharedRoomExistService(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

    // MARK 获取空间信息
    getSharedRoomList: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedRoomList(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

    // MARK 获取房间构件
    getSharedRoomElement: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedRoomElement(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

    // MARK 获取房间信息
    getSharedRoomInfo: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedRoomInfo(paran).then((res) => {
                if (res.isSuccess) {
                    resolve(res.data);
                }
            });
        });
    },

}


export default api;


