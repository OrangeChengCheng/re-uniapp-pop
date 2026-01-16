<template>
    <div class="sup-model-tree">
        <el-tabs v-if="roomExist" v-model="activeName" type="card" class="eltabs-area" @tab-click="eltabs_tabChilck">
            <el-tab-pane label="构件" name="elem">
                <elem-comp
                    ref="ref_elem_comp"
                    :sceneId="sceneId"
                    :elem_treeList="elem_treeList"
                    :camToElem="camToElem"
                    :camToDataSet="camToDataSet"
                    :dataSetVisible="dataSetVisible"
                    :elemVisible="elemVisible"
                    :resetElemAttr="resetElemAttr"></elem-comp>
            </el-tab-pane>
            <el-tab-pane label="房间和面积" name="room">
                <room-comp :sceneId="sceneId" :room_treeList="room_treeList" :showRoom="showRoom"></room-comp>
            </el-tab-pane>
        </el-tabs>
        <elem-comp
            v-else
            :sceneId="sceneId"
            :elem_treeList="elem_treeList"
            :camToElem="camToElem"
            :camToDataSet="camToDataSet"
            :dataSetVisible="dataSetVisible"
            :elemVisible="elemVisible"
            :resetElemAttr="resetElemAttr"></elem-comp>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ElTree } from 'element-plus';
import { ref, onMounted, nextTick, watch } from 'vue';
import ElemComp from './ElemComp.vue';
import RoomComp from './RoomComp.vue';
import type { TabsPaneContext } from 'element-plus';

const REService = (window as any).$service;

const props = defineProps({
    sceneId: String,
    camToElem: Function,
    camToDataSet: Function,
    dataSetVisible: Function,
    elemVisible: Function,
    showRoom: Function,
    resetRoom: Function,
    resetElemAttr: Function,
    updateTreeData: Function,
});

const ref_elem_comp = ref<InstanceType<typeof ElemComp> | null>(null);
const formatType = ref(1);
const activeName = ref('elem');
const roomExist = ref(false);
const elem_treeList = ref<any[]>([]);
const room_treeList = ref<any[]>([]);

watch(
    () => elem_treeList.value,
    () => {
        props.updateTreeData?.(elem_treeList.value);
    },
    {
        deep: true,
    }
);

onMounted(() => {
    service_getInfo();
});

// MARK servi 获取信息
const service_getInfo = async () => {
    elem_treeList.value = [];
    room_treeList.value = [];

    roomExist.value = await service_checkRoomExist();
    elem_treeList.value = await service_getProjectTree();

    if (roomExist.value) {
        room_treeList.value = await service_getRoomList();
        roomExist.value = Boolean(room_treeList.value.length);
    }
};

// MARK service 查询是否有房间信息
const service_checkRoomExist = (): Promise<any> => {
    return new Promise<any>((resolve) => {
        let params = { dataSetId: props.sceneId };
        REService.isSharedRoomExistService(params).then((res: any) => {
            resolve(res.exist);
        });
    });
};

// MARK service 获取目录树-数据集
const service_getProjectTree = () => {
    return new Promise<any>((resolve) => {
        let params = { dataSetId: props.sceneId };
        REService.getSharedProjectTree(params).then((res: any) => {
            formatType.value = res[0].formatType;
            let treeData = handle_formatDataSetTree(res);
            resolve(treeData);
        });
    });
};

// MARK service 获取空间信息
const service_getRoomList = () => {
    return new Promise<any>((resolve) => {
        const fileNames = handle_getRoomName();
        let params = {
            dataSetId: props.sceneId,
            fileNames: fileNames,
        };
        REService.getSharedRoomList(params).then((res: any) => {
            let data = res;
            data = data.filter((item: any) => {
                let rooms = item.rooms;
                if (rooms[0] && item.elementIntIds) {
                    return true;
                } else {
                    return false;
                }
            });

            let roomTreeData = data.map((item: any) => {
                item['nodeName'] = item.hostFileName;
                item['nodeId'] = item.hostFileId;
                item['nodes'] = item.rooms;
                return item;
            });
            resolve(roomTreeData);
        });
    });
};

// MARK data 格式化-数据集树
const handle_formatDataSetTree = (dataSetList: any) => {
    const formatType = dataSetList[0]?.formatType;
    let treeData = [];
    if (formatType === 1) {
        treeData = dataSetList[0].files;
        treeData.forEach((item: any) => {
            item['customNodeType'] = 'dataSet';
            item['formatType'] = formatType;
            item['name'] = item.fileName;
            item['dataSetId'] = dataSetList[0].dataSetId;
            item['dataSetType'] = dataSetList[0].dataSetType;
            item.nodes = [{ name: '' }];
        });
    }
    if (formatType === 2) {
        dataSetList.forEach((item: any) => {
            item['customNodeType'] = 'dataSet';
            item['name'] = item.dataSetName;
            item.nodes = item.files;
            item.nodes.forEach((node: any) => {
                node['customNodeType'] = 'file';
                node['name'] = node.fileName;
                node.nodes = [{ name: '' }];
            });
        });
        treeData = dataSetList;
    }
    return treeData;
};

// MARK data 获取房间名称
const handle_getRoomName = () => {
    // 带有房间和图纸信息的模型来源(根据srcCatalog字段判断来源)
    const FileSrcWithRoomInfo = [0, 1, 4];

    let pakNodeDatas = [];
    if (formatType.value === 1) {
        pakNodeDatas = elem_treeList.value;
    } else {
        pakNodeDatas = elem_treeList.value[0].nodes;
    }
    let roomFiles = pakNodeDatas.filter((el: any) => FileSrcWithRoomInfo.includes(el.srcCatalog));
    let roomFilesName = roomFiles.map((item: any) => {
        return item.name;
    });
    return roomFilesName;
};

// MARK eltabs tab切换
const eltabs_tabChilck = (tab: TabsPaneContext, event: Event) => {
    if (tab.props.name == 'elem') {
        props.resetRoom?.();
        nextTick(() => {
            if (ref_elem_comp.value && ref_elem_comp.value.ref_eltree) {
                // 使用类型断言确保类型安全
                const eltree = ref_elem_comp.value.ref_eltree as InstanceType<typeof ElTree>;
                eltree.setCheckedKeys([elem_treeList.value[0].uniqueId]);
            }
        });
    }
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-model-tree {
    position: relative;
    width: 100%;
    height: 100%;

    :deep(.eltabs-area) {
        position: relative;
        width: 100%;
        height: 100%;

        .el-tabs__header {
            border-bottom: 1px solid #5c5c5c;
            position: relative;
            display: flex;
            flex-direction: column;

            .el-tabs__nav {
                border: none;
            }

            .el-tabs__item {
                background-color: transparent;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                border: 1px solid #5c5c5c !important;
                font-size: 14px;
                font-weight: 400;
                color: white;
                height: 32px;
                line-height: 32px;

                &:not(:first-child) {
                    margin-left: 8px;
                }
            }

            .is-active {
                background-color: var(--color-main-blue) !important;
                color: white !important;
            }
        }

        .el-tabs__content {
            position: relative;
            display: flex;
            width: 100%;
            height: 100%;

            .el-tab-pane {
                position: relative;
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>
