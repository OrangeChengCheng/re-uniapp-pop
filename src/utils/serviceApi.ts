/*
 * @Author: Lemon C
 * @Date: 2025-07-21 10:25:29
 * @LastEditTime: 2025-12-24 10:46:09
 */
import {
    getSharedSceneById,
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
    getSharedBimElemTreeNodesByGroupService,
    getSharedBimElemIdsByGroupService,
} from '@/service/interface';

interface ApiMethods {
    getSharedSceneById(paran: any): Promise<any>;
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
    getSharedBimElemTreeNodesByGroupService(paran: any): Promise<any>;
    getSharedBimElemIdsByGroupService(paran: any): Promise<any>;
}

const api: ApiMethods = {
    // MARK 根据场景id查询场景信息
    getSharedSceneById: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedSceneById(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 根据树id查询树
    getSharedProjectSceneTree: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectSceneTree(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 获取树目录
    getSharedProjectTree: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTree(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 请求模型目录树子节点-懒加载
    getSharedProjectTreeSubNodesByLazy: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTreeSubNodesByLazy(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 请求模型目录树子节点
    getSharedProjectTreeSubNodes: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTreeSubNodes(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 请求模型目录树下的构件ID-懒加载
    getSharedProjectTreeChildrenByLazy: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTreeChildrenByLazy(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 请求模型目录树下的构件ID
    getSharedProjectTreeChildren: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedProjectTreeChildren(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 是否具有空间信息
    isSharedRoomExistService: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            isSharedRoomExistService(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 获取空间信息
    getSharedRoomList: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedRoomList(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 获取房间构件
    getSharedRoomElement: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedRoomElement(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 获取房间信息
    getSharedRoomInfo: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedRoomInfo(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 根据分组获取目录树子节点
    getSharedBimElemTreeNodesByGroupService: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedBimElemTreeNodesByGroupService(paran).then((res) => {
                resolve(res);
            });
        });
    },

    // MARK 获取RvtGroup节点关联的构件id
    getSharedBimElemIdsByGroupService: (paran: any): Promise<any> => {
        return new Promise<any>((resolve) => {
            getSharedBimElemIdsByGroupService(paran).then((res) => {
                resolve(res);
            });
        });
    },

}


export default api;


