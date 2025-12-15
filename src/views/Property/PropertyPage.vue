<!--
 * @Author: Lemon C
 * @Date: 2025-07-07 14:58:27
 * @LastEditTime: 2025-12-11 17:32:12
-->
<template>
    <base-view :base_appTpWebMsg_callback="handle_appToWebMsg">
        <div class="peoperty-container">
            <property-model v-if="propertyType == 1" :basic_list="modelAttrList_basic" :extend_list="modelAttrList_extend"></property-model>
            <property-entity
                v-else-if="propertyType == 2"
                :select_list="entityAttrTypeList"
                :attr_list="entityAttrList"
                :elselect_change="elselect_change"></property-entity>
            <property-shp v-else-if="propertyType == 3" :attr_list="shpAttrList"></property-shp>
            <empty-comp v-else :empty_title="'选择一个场景对象，查看其属性信息'"></empty-comp>
        </div>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';
import PropertyModel from '@/components/Property/PropertyModel.vue';
import PropertyEntity from '@/components/Property/PropertyEntity.vue';
import PropertyShp from '@/components/Property/PropertyShp.vue';
import EmptyComp from '@/components/Empty/EmptyComp.vue';
import { getSharedProjectParam, getSharedVectorParam, getElemParamTypeService, getElemParamService } from '@/service/interface';
import { useStateStore } from '@/stores/state';

const state_store = useStateStore();
const NativeBridge = (window as any).$reapi;
const instance = getCurrentInstance() as any;
const propertyType = ref(0); //属性类型 0：无类型  1：模型  2：单构件  3：矢量
const re_selModel_cur = ref<any>(null);
const modelAttrList_basic = ref<any[]>([]);
const modelAttrList_extend = ref<any[]>([]);
const shpAttrList = ref<any[]>([]);
const entityAttrTypeList = ref<any[]>([]);
const entityAttrList = ref<any[]>([]);

onMounted(() => {
    // const msgData = {
    //     data: {
    //         dataSetType: 0,
    //         probeInfo: {
    //             dataSetId: '3a1e0f8e-f06f-7068-259b-3d8498f7f998',
    //             elemType: 'BIMElem',
    //             elemId: 23,
    //             elemBV: [
    //                 [-19.009716033935547, -9.669635772705078, 2.438307046890259],
    //                 [6.417759418487549, 14.551069259643555, 2.495642900466919],
    //             ],
    //             elemScrPos: [194, 398],
    //             elemCenter: [-6.295978307723999, 2.4407167434692383, 2.466974973678589],
    //             elemPos: [-6.052760597128636, 1.5369548254829368, 2.4955620024442737],
    //         },
    //     },
    //     msgId: '',
    //     type: 'Probe.getCurCombProbeRet',
    //     isResponse: false,
    // };
    // state_store.updateCurrBaseUrl('http://192.168.31.14:9012');
    // setTimeout(() => {
    //     instance?.proxy.$showLoading();
    //     server_getAttrData(msgData.data);
    // }, 10000);
});

// MARK App->Web 接收App消息
const handle_appToWebMsg = (msgData: any) => {
    if (msgData) {
        if (msgData.type == 'Probe.getCurCombProbeRet') {
            instance?.proxy.$showLoading();
            server_getAttrData(msgData.data);
            re_selModel_cur.value = msgData.data;
            modelAttrList_basic.value = [];
            modelAttrList_extend.value = [];
            shpAttrList.value = [];
            entityAttrTypeList.value = [];
            entityAttrList.value = [];
        }
    } else {
        instance?.proxy.$hideLoading();
    }
};

// MARK Server 获取属性信息
const server_getAttrData = (re_selModel: any) => {
    if (re_selModel.probeInfo.elemType == 'BIMElem') {
        if (re_selModel.dataSetType == 0) {
            propertyType.value = 1;
            server_getAttrData_model(re_selModel);
        } else {
            propertyType.value = 2;
            server_getAttrData_entity(re_selModel);
        }
    } else if (re_selModel.probeInfo.elemType == 'ShapeElem') {
        propertyType.value = 3;
        server_getAttrData_shp(re_selModel);
    }
};

// MARK Server 获取模型构件属性
const server_getAttrData_model = (re_selModel: any) => {
    let params = {
        dataSetId: re_selModel.probeInfo.dataSetId,
        elementIntId: re_selModel.probeInfo.elemId,
        isQueryExtend: true,
    };
    getSharedProjectParam(params).then((res) => {
        instance?.proxy.$hideLoading();
        if (res) {
            handle_modelData(res);
        } else {
            modelAttrList_basic.value = [];
            modelAttrList_extend.value = [];
        }
    });
};

// MARK Server 获取矢量属性
const server_getAttrData_shp = (re_selModel: any) => {
    let dataSetId = '';
    let shpElemId = re_selModel.probeInfo.elemIdStr;
    if (shpElemId.length) {
        dataSetId = shpElemId.split('_')[1];
    }

    const findObj = re_selModel.dataSetList.find((el: any) => {
        const resId = el.dataSetId.replace(/-/g, ''); //不能使用replaceAll,app端异常
        if (dataSetId == resId) return true;
    });
    if (!findObj) return;

    let params = { dataSetId: findObj.dataSetId, elemId: shpElemId };
    getSharedVectorParam(params).then((res) => {
        instance?.proxy.$hideLoading();
        if (res) {
            handle_shpData(res);
        } else {
            shpAttrList.value = [];
        }
    });
};

// MARK Server 获取单构件属性--类型
const server_getAttrData_entity = async (re_selModel: any) => {
    const findObj = re_selModel.entityList.find((el: any) => el.elemId == re_selModel.probeInfo.elemId);
    if (!findObj) return;

    let params_type = { dataSetId: findObj.dataSetId, hostFileId: Number(findObj.entityType) };

    // 获取属性类型
    const res_type = await server_getAttrData_entity_type(params_type);

    let paramType;
    if (res_type.length) {
        paramType = res_type[0].paramsType;
    } else {
        paramType = 'default';
    }
    let params_info = {
        dataSetId: findObj.dataSetId,
        dataSetType: re_selModel.dataSetType,
        hostFileId: Number(findObj.entityType),
        id: findObj.entityId,
        paramType: paramType,
    };
    const res_attr = await server_getAttrData_entity_info(params_info);
    handle_entityData(res_type, res_attr);
};

// MARK Server 获取单构件属性--类型
const server_getAttrData_entity_type = (params: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getElemParamTypeService(params).then((res) => {
            if (res) {
                resolve(res);
            } else {
                reject(null);
            }
        });
    });
};

// MARK Server 获取单构件属性--信息
const server_getAttrData_entity_info = (params: any): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        getElemParamService(params).then((res) => {
            instance?.proxy.$hideLoading();
            if (res) {
                resolve(res);
            } else {
                reject(null);
            }
        });
    });
};

// MARK Data 处理模型构件属性
const handle_modelData = (modelData: any) => {
    modelAttrList_basic.value = [];
    modelAttrList_extend.value = [];
    if (modelData.elementParamGroups && modelData.elementParamGroups.length) {
        modelAttrList_basic.value = modelData.elementParamGroups;
    }
    if (modelData.extendParams && modelData.extendParams.length) {
        let extendParamsArray: any[] = [];
        modelData.extendParams.forEach((item: any) => {
            let find = extendParamsArray.find((el) => el.extendParamGroupId === item.extendParamGroupId);
            let paramsObj = {
                paramName: item.extendParamName,
                paramValue: item.extendParamValue,
                paramType: item.extendParamType,
            };
            if (find) {
                find.paramDatas.push(paramsObj);
            } else {
                let obj: any = {
                    extendParamGroupId: item.extendParamGroupId,
                    paramGroup: item.extendParamGroupName,
                };
                let paramDatas = [];
                paramDatas.push(paramsObj);
                obj.paramDatas = paramDatas;
                extendParamsArray.push(obj);
            }
        });
        modelAttrList_extend.value = extendParamsArray;
    }
};

// MARK Data 处理单构件属性
const handle_entityData = (entityTypes: any, entityData: any, updateType: boolean = true, updateData: boolean = true) => {
    if (updateType) {
        entityAttrTypeList.value = [];
        if (entityTypes.length) {
            entityAttrTypeList.value = entityTypes;
        } else {
            entityAttrTypeList.value = [{ paramsId: 'default', paramsType: '默认' }];
        }
    }

    if (updateData) {
        entityAttrList.value = [];
        entityData.forEach((el: any) => {
            let paransData: any = {
                paramGroup: el.group,
                paramDatas: el.data,
            };
            entityAttrList.value.push(paransData);
        });
    }
};

// MARK Data 处理矢量属性
const handle_shpData = (shpData: any) => {
    shpAttrList.value = [];
    shpData.forEach((el: any) => {
        shpAttrList.value.push({
            paramName: el.key,
            paramValue: el.value,
        });
    });
};

// MARK Callback el-select 选择回调
const elselect_change = async (e: any) => {
    instance?.proxy.$showLoading();
    const findObj = re_selModel_cur.value.entityList.find((el: any) => el.elemId == re_selModel_cur.value.probeInfo.elemId);
    if (!findObj) return;
    let params_info = {
        dataSetId: findObj.dataSetId,
        dataSetType: re_selModel_cur.value.dataSetType,
        hostFileId: Number(findObj.entityType),
        id: findObj.entityId,
        paramType: e,
    };
    const res_attr = await server_getAttrData_entity_info(params_info);
    handle_entityData([], res_attr, false);
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.peoperty-container {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 16px 20px 30px 20px;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
}
</style>
