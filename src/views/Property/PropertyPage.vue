<!--
 * @Author: Lemon C
 * @Date: 2025-07-07 14:58:27
 * @LastEditTime: 2026-01-16 10:29:33
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
            <property-shp-more v-else-if="propertyType == 4" :attr_list="shpMoreAttrList"></property-shp-more>
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
import PropertyShpMore from '@/components/Property/PropertyShpMore.vue';
import EmptyComp from '@/components/Empty/EmptyComp.vue';
import { getSharedProjectParam, getSharedVectorParam, getElemParamTypeService, getElemParamService } from '@/service/interface';
import { useStateStore } from '@/stores/state';

const state_store = useStateStore();
const NativeBridge = (window as any).$reapi;
const Tool = (window as any).$tool;
const instance = getCurrentInstance() as any;
const propertyType = ref(0); //属性类型 0：无类型  1：模型  2：单构件  3：矢量
const re_selModel_cur = ref<any>(null);
const modelAttrList_basic = ref<any[]>([]);
const modelAttrList_extend = ref<any[]>([]);
const shpAttrList = ref<any[]>([]);
const shpMoreAttrList = ref<any[]>([]);
const entityAttrTypeList = ref<any[]>([]);
const entityAttrList = ref<any[]>([]);
const treeList = ref<any[]>([]);

onMounted(() => {
    const msgData4 = {
        data: {
            dataSetType: 0,
            probeInfo: {
                dataSetId: '3a1e0f8e-f06f-7068-259b-3d8498f7f998',
                elemType: 'BIMElem',
                elemId: 23,
                elemBV: [
                    [-19.009716033935547, -9.669635772705078, 2.438307046890259],
                    [6.417759418487549, 14.551069259643555, 2.495642900466919],
                ],
                elemScrPos: [194, 398],
                elemCenter: [-6.295978307723999, 2.4407167434692383, 2.466974973678589],
                elemPos: [-6.052760597128636, 1.5369548254829368, 2.4955620024442737],
            },
        },
        msgId: '',
        type: 'Probe.getCurCombProbeRet',
        isResponse: false,
    };

    const msgData2 = {
        data: {
            probeInfo: {
                dataSetId: '',
                dataSetIdList: [],
                elemBV: [
                    [0.0, 0.0, 0.0],
                    [0.0, 0.0, 0.0],
                ],
                elemCenter: [0.0, 0.0, 0.0],
                elemId: 0,
                elemIdStr: 'MonomerRgnShape:3a1ed2bc-6ea4-97d5-ab7a-e82ccbe41cec',
                elemPos: [153.61202741421744, -124.90526605036149, -35.54999381763163],
                elemScrPos: [337, 600],
                elemType: 'ShapeElem',
            },
        },
        isResponse: false,
        msgId: '',
        type: 'Listen.systemSelShpElement',
    };

    const msgData3 = {
        data: {
            dataSetType: 19,
            entityList: [
                {
                    dataSetCRS: '',
                    dataSetId: '3a1ed2bc-aa23-97cf-5a51-523bee673da2',
                    elemId: 11,
                    entityId: '3a1ed2b9-932b-d31a-8567-19affc5f949d',
                    entityType: '1',
                    offset: [-6.232807153377358, 30.25899877320936, 0.0],
                    rotate: [0.0, 0.0, 0.0, 1.0],
                    scale: [1.0, 1.0, 1.0],
                },
            ],
            probeInfo: {
                dataSetId: '3a1ed2bc-aa23-97cf-5a51-523bee673da2',
                dataSetIdList: [],
                elemBV: [
                    [-8.733482207630743, 28.290100659799037, -0.0017563740980506282],
                    [-3.7193373101698057, 32.32107600159591, 3.006731327317965],
                ],
                elemCenter: [-3.186534346890621e-58, 2.712622938947e-312, -16.04693223164578],
                elemId: 11,
                elemIdStr: '',
                elemPos: [-6.979416862386579, 31.865830216863216, 0.7324197091028992],
                elemScrPos: [144, 631],
                elemType: 'BIMElem',
            },
        },
        isResponse: false,
        msgId: '',
        type: 'Listen.systemSelElement',
    };

    const msgData = {
        data: [
            {
                projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                dataSetId: '00000000-0000-0000-0000-000000000000',
                dataSetType: 0,
                srcDataSetType: 0,
                srcDataSetId: '00000000-0000-0000-0000-000000000000',
                sceneNodeId: '3a1ed2b9-1810-11f5-9152-59606bc568f9',
                sceneNodeName: 'BIM模型',
                parentId: '00000000-0000-0000-0000-000000000000',
                levelCode: '3a1ed2b9-1810-11f5-9152-59606bc568f9',
                levelPathName: 'BIM模型',
                nodeType: 3,
                viewStatus: 0,
                status: null,
                hasTexture: false,
                coordinates: null,
                hasUpdated: false,
                isTouchDown: false,
                isDigHole: false,
                lod: 0,
                visibleDistance: 0,
                sortNum: 0,
                isNew: false,
                disableReason: null,
                systemLodConfig: null,
                componentInfo: null,
                waterInfo: null,
                excavateInfo: null,
                monomerizationInfo: null,
                hasRvtGroup: true,
                fileIntId: null,
                uniqueId: null,
                formatType: 0,
                enableLazyLoading: false,
                subNodes: [
                    {
                        projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                        dataSetId: '3a1deb61-fbb0-8326-8cbe-429f4acbe7af',
                        dataSetType: 0,
                        srcDataSetType: 0,
                        srcDataSetId: '3a1deb61-fbb0-8326-8cbe-429f4acbe7af',
                        sceneNodeId: '3a1ed2b9-181d-4d3a-1b1f-51a272cfcbfc',
                        sceneNodeName: '医院CT室-BIM案例模型.rvt',
                        parentId: '3a1ed2b9-1810-11f5-9152-59606bc568f9',
                        levelCode: '3a1ed2b9-1810-11f5-9152-59606bc568f9/3a1ed2b9-181d-4d3a-1b1f-51a272cfcbfc',
                        levelPathName: 'BIM模型/医院CT室-BIM案例模型.rvt',
                        nodeType: 2,
                        viewStatus: 0,
                        status: null,
                        hasTexture: false,
                        coordinates: null,
                        hasUpdated: false,
                        isTouchDown: false,
                        isDigHole: false,
                        lod: 0,
                        visibleDistance: 0,
                        sortNum: 0,
                        isNew: false,
                        disableReason: null,
                        systemLodConfig: null,
                        componentInfo: null,
                        waterInfo: null,
                        excavateInfo: null,
                        monomerizationInfo: null,
                        hasRvtGroup: true,
                        fileIntId: '-1',
                        uniqueId: '1',
                        formatType: 1,
                        enableLazyLoading: false,
                        subNodes: [{ nodeName: '' }],
                        lastModificationTime: '2026-01-15T15:30:09.528',
                        creationTime: '2026-01-15T15:26:15.581',
                        customNodeType: 'dataSet',
                        nodeId: '3a1ed2b9-181d-4d3a-1b1f-51a272cfcbfc',
                        nodeName: '医院CT室-BIM案例模型.rvt',
                    },
                ],
                lastModificationTime: '2026-01-15T15:30:09.528',
                creationTime: '2026-01-15T15:26:15.568',
                nodeName: 'BIM模型',
                nodeId: '3a1ed2b9-1810-11f5-9152-59606bc568f9',
            },
            {
                projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                dataSetId: '00000000-0000-0000-0000-000000000000',
                dataSetType: 11,
                srcDataSetType: 11,
                srcDataSetId: '00000000-0000-0000-0000-000000000000',
                sceneNodeId: '3a1ed2b9-afc6-2937-2e7e-0dff733c18d0',
                sceneNodeName: '倾斜摄影',
                parentId: '00000000-0000-0000-0000-000000000000',
                levelCode: '3a1ed2b9-afc6-2937-2e7e-0dff733c18d0',
                levelPathName: '倾斜摄影',
                nodeType: 3,
                viewStatus: 0,
                status: null,
                hasTexture: false,
                coordinates: null,
                hasUpdated: false,
                isTouchDown: false,
                isDigHole: false,
                lod: 0,
                visibleDistance: 0,
                sortNum: 0,
                isNew: false,
                disableReason: null,
                systemLodConfig: null,
                componentInfo: null,
                waterInfo: null,
                excavateInfo: null,
                monomerizationInfo: null,
                hasRvtGroup: false,
                fileIntId: null,
                uniqueId: null,
                formatType: 0,
                enableLazyLoading: false,
                subNodes: [
                    {
                        projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                        dataSetId: '3a1d16e5-aa9f-9da2-e5ba-6c396f52b4cd',
                        dataSetType: 11,
                        srcDataSetType: 11,
                        srcDataSetId: '3a1d16e5-aa9f-9da2-e5ba-6c396f52b4cd',
                        sceneNodeId: '3a1ed2b9-afd3-5b82-b437-5285a1835f25',
                        sceneNodeName: 'terra_osgbs-2(新).osgbzip',
                        parentId: '3a1ed2b9-afc6-2937-2e7e-0dff733c18d0',
                        levelCode: '3a1ed2b9-afc6-2937-2e7e-0dff733c18d0/3a1ed2b9-afd3-5b82-b437-5285a1835f25',
                        levelPathName: '倾斜摄影/terra_osgbs-2(新).osgbzip',
                        nodeType: 2,
                        viewStatus: 0,
                        status: null,
                        hasTexture: false,
                        coordinates: null,
                        hasUpdated: false,
                        isTouchDown: false,
                        isDigHole: false,
                        lod: 0,
                        visibleDistance: 0,
                        sortNum: 0,
                        isNew: false,
                        disableReason: null,
                        systemLodConfig: null,
                        componentInfo: null,
                        waterInfo: null,
                        excavateInfo: null,
                        monomerizationInfo: null,
                        hasRvtGroup: false,
                        fileIntId: null,
                        uniqueId: null,
                        formatType: 0,
                        enableLazyLoading: false,
                        subNodes: [],
                        lastModificationTime: '2026-01-15T15:30:09.529',
                        creationTime: '2026-01-15T15:26:54.419',
                        customNodeType: 'dataSet',
                        nodeId: '3a1ed2b9-afd3-5b82-b437-5285a1835f25',
                        nodeName: 'terra_osgbs-2(新).osgbzip',
                    },
                ],
                lastModificationTime: '2026-01-15T15:30:09.528',
                creationTime: '2026-01-15T15:26:54.407',
                nodeName: '倾斜摄影',
                nodeId: '3a1ed2b9-afc6-2937-2e7e-0dff733c18d0',
            },
            {
                projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                dataSetId: '00000000-0000-0000-0000-000000000000',
                dataSetType: 19,
                srcDataSetType: 19,
                srcDataSetId: '00000000-0000-0000-0000-000000000000',
                sceneNodeId: '3a1ed2bc-aa23-97cf-5a51-523bee673da2',
                sceneNodeName: '构件',
                parentId: '00000000-0000-0000-0000-000000000000',
                levelCode: '3a1ed2bc-aa23-97cf-5a51-523bee673da2',
                levelPathName: '构件',
                nodeType: 3,
                viewStatus: 0,
                status: null,
                hasTexture: false,
                coordinates: null,
                hasUpdated: false,
                isTouchDown: false,
                isDigHole: false,
                lod: 0,
                visibleDistance: 0,
                sortNum: 0,
                isNew: false,
                disableReason: null,
                systemLodConfig: null,
                componentInfo: null,
                waterInfo: null,
                excavateInfo: null,
                monomerizationInfo: null,
                hasRvtGroup: false,
                fileIntId: null,
                uniqueId: null,
                formatType: 0,
                enableLazyLoading: false,
                subNodes: [
                    {
                        projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                        dataSetId: '3a1ed2b9-932b-d31a-8567-19affc5f949d',
                        dataSetType: 19,
                        srcDataSetType: 17,
                        srcDataSetId: '3a163061-6f10-c9a7-5982-edc126fd756e',
                        sceneNodeId: '3a1ed2b9-932b-d31a-8567-19affc5f949d',
                        sceneNodeName: '工作间 (1)(1)',
                        parentId: '3a1ed2bc-aa23-97cf-5a51-523bee673da2',
                        levelCode: '3a1ed2bc-aa23-97cf-5a51-523bee673da2/3a1ed2b9-932b-d31a-8567-19affc5f949d',
                        levelPathName: '构件/工作间 (1)(1)',
                        nodeType: 2,
                        viewStatus: 0,
                        status: null,
                        hasTexture: false,
                        coordinates: null,
                        hasUpdated: false,
                        isTouchDown: false,
                        isDigHole: false,
                        lod: 0,
                        visibleDistance: 0,
                        sortNum: 0,
                        isNew: false,
                        disableReason: null,
                        systemLodConfig: null,
                        componentInfo: {
                            instanceIndex: 1,
                            playMode: 'REPEAT',
                            enableAnimationPlay: true,
                            location: {
                                DataSetCRS: '',
                                scale: '[1,1,1]',
                                rotate: '[0,0,0,1]',
                                translation: '[-6.232807153377358,30.25899877320936,0]',
                            },
                            hostFileId: 1,
                            isPublished: true,
                            isRemoved: false,
                            hasAnimation: true,
                            treeNodeId: '3a1ed2b9-932b-d31a-8567-19affc5f949d',
                            id: '3a1ed2b9-932b-d31a-8567-19affc5f949d',
                            dataSetId: '3a1ed2bc-aa23-97cf-5a51-523bee673da2',
                            elemId: 11,
                        },
                        waterInfo: null,
                        excavateInfo: null,
                        monomerizationInfo: null,
                        hasRvtGroup: false,
                        fileIntId: null,
                        uniqueId: null,
                        formatType: 0,
                        enableLazyLoading: false,
                        subNodes: [],
                        lastModificationTime: '2026-01-15T15:30:09.604632',
                        creationTime: '2026-01-15T15:26:47.083',
                        customNodeType: 'dataSet',
                        nodeId: '3a1ed2b9-932b-d31a-8567-19affc5f949d',
                        nodeName: '工作间 (1)(1)',
                    },
                ],
                lastModificationTime: '2026-01-15T15:30:09.602281',
                creationTime: '2026-01-15T15:26:47.067',
                nodeName: '构件',
                nodeId: '3a1ed2bc-aa23-97cf-5a51-523bee673da2',
            },
            {
                projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                dataSetId: '00000000-0000-0000-0000-000000000000',
                dataSetType: 23,
                srcDataSetType: 23,
                srcDataSetId: '00000000-0000-0000-0000-000000000000',
                sceneNodeId: '3a1ed2ba-c5f2-41d6-a5fd-5695403c1702',
                sceneNodeName: '水面',
                parentId: '00000000-0000-0000-0000-000000000000',
                levelCode: '3a1ed2ba-c5f2-41d6-a5fd-5695403c1702',
                levelPathName: '水面',
                nodeType: 3,
                viewStatus: 0,
                status: null,
                hasTexture: false,
                coordinates: null,
                hasUpdated: false,
                isTouchDown: false,
                isDigHole: false,
                lod: 0,
                visibleDistance: 0,
                sortNum: 0,
                isNew: false,
                disableReason: null,
                systemLodConfig: null,
                componentInfo: null,
                waterInfo: null,
                excavateInfo: null,
                monomerizationInfo: null,
                hasRvtGroup: false,
                fileIntId: null,
                uniqueId: null,
                formatType: 0,
                enableLazyLoading: false,
                subNodes: [
                    {
                        projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                        dataSetId: '3a1ed2ba-c5d3-24b6-9601-f521c2ce8f13',
                        dataSetType: 23,
                        srcDataSetType: 23,
                        srcDataSetId: '3a1ed2ba-c5d3-24b6-9601-f521c2ce8f13',
                        sceneNodeId: '3a1ed2ba-c603-9d9d-40f7-286fdf3512ad',
                        sceneNodeName: '水面区域-20260115152750',
                        parentId: '3a1ed2ba-c5f2-41d6-a5fd-5695403c1702',
                        levelCode: '3a1ed2ba-c5f2-41d6-a5fd-5695403c1702/3a1ed2ba-c603-9d9d-40f7-286fdf3512ad',
                        levelPathName: '水面/水面区域-20260115152750',
                        nodeType: 2,
                        viewStatus: 0,
                        status: null,
                        hasTexture: false,
                        coordinates: null,
                        hasUpdated: false,
                        isTouchDown: false,
                        isDigHole: false,
                        lod: 0,
                        visibleDistance: 0,
                        sortNum: 0,
                        isNew: false,
                        disableReason: null,
                        systemLodConfig: null,
                        componentInfo: null,
                        waterInfo: {
                            id: '3a1ed2ba-c5d3-24b6-9601-f521c2ce8f13',
                            geoJson:
                                '{"waterName":"Water_1768462070845","waterClr":{"red":0,"green":247,"blue":255,"alpha":102},"blendDist":0,"visible":true,"expandDist":0,"depthBias":0,"visDist":200000,"rgnList":[{"pointList":[[200.9253931972292,-149.85584996186583,-51.083512189596604],[107.55445605117018,-165.4011596928149,-51.91900549934003],[137.52418243603685,-256.37583913172125,-55.885469920696465]],"indexList":[2,0,1]}]}',
                            color: '#00F7FF',
                            transparency: 0.4,
                            blendDist: 0,
                            expandDist: 0,
                            depthBias: 0,
                            visDist: 200000,
                        },
                        excavateInfo: null,
                        monomerizationInfo: null,
                        hasRvtGroup: false,
                        fileIntId: null,
                        uniqueId: null,
                        formatType: 0,
                        enableLazyLoading: false,
                        subNodes: [],
                        lastModificationTime: '2026-01-15T15:30:09.529',
                        creationTime: '2026-01-15T15:28:05.635',
                        customNodeType: 'dataSet',
                        nodeId: '3a1ed2ba-c603-9d9d-40f7-286fdf3512ad',
                        nodeName: '水面区域-20260115152750',
                        waterId: '3a1ed2ba-c5d3-24b6-9601-f521c2ce8f13',
                    },
                ],
                lastModificationTime: '2026-01-15T15:30:09.529',
                creationTime: '2026-01-15T15:28:05.618',
                nodeName: '水面',
                nodeId: '3a1ed2ba-c5f2-41d6-a5fd-5695403c1702',
            },
            {
                projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                dataSetId: '00000000-0000-0000-0000-000000000000',
                dataSetType: 24,
                srcDataSetType: 24,
                srcDataSetId: '00000000-0000-0000-0000-000000000000',
                sceneNodeId: '3a1ed2ba-7e12-e643-1181-420c3b6c293e',
                sceneNodeName: '开挖',
                parentId: '00000000-0000-0000-0000-000000000000',
                levelCode: '3a1ed2ba-7e12-e643-1181-420c3b6c293e',
                levelPathName: '开挖',
                nodeType: 3,
                viewStatus: 0,
                status: null,
                hasTexture: false,
                coordinates: null,
                hasUpdated: false,
                isTouchDown: false,
                isDigHole: false,
                lod: 0,
                visibleDistance: 0,
                sortNum: 0,
                isNew: false,
                disableReason: null,
                systemLodConfig: null,
                componentInfo: null,
                waterInfo: null,
                excavateInfo: null,
                monomerizationInfo: null,
                hasRvtGroup: false,
                fileIntId: null,
                uniqueId: null,
                formatType: 0,
                enableLazyLoading: false,
                subNodes: [
                    {
                        projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                        dataSetId: '3a1ed2ba-7dea-879e-2179-c829972af9b8',
                        dataSetType: 24,
                        srcDataSetType: 24,
                        srcDataSetId: '3a1ed2ba-7dea-879e-2179-c829972af9b8',
                        sceneNodeId: '3a1ed2ba-7e26-d328-0ae5-70d6ba873de0',
                        sceneNodeName: '开挖区域-20260115152732',
                        parentId: '3a1ed2ba-7e12-e643-1181-420c3b6c293e',
                        levelCode: '3a1ed2ba-7e12-e643-1181-420c3b6c293e/3a1ed2ba-7e26-d328-0ae5-70d6ba873de0',
                        levelPathName: '开挖/开挖区域-20260115152732',
                        nodeType: 2,
                        viewStatus: 0,
                        status: null,
                        hasTexture: false,
                        coordinates: null,
                        hasUpdated: false,
                        isTouchDown: false,
                        isDigHole: false,
                        lod: 0,
                        visibleDistance: 0,
                        sortNum: 0,
                        isNew: false,
                        disableReason: null,
                        systemLodConfig: null,
                        componentInfo: null,
                        waterInfo: null,
                        excavateInfo: {
                            id: '3a1ed2ba-7dea-879e-2179-c829972af9b8',
                            digType: 1,
                            textureFileDataId: null,
                            geoJson:
                                '{"extrudeId":"Extrude_1768462052814","dataSetIdList":["3a1d16e5aa9f9da2e5ba6c396f52b4cd"],"rgnList":[[[103.49663818984857,-224.9275385008461,-76.97192016739214],[47.349907622948365,-256.29461061290954,-76.85603449696474],[69.49764627642986,-318.0230805997021,-75.07628474016514],[114.31700418308174,-295.995030979494,-76.87342586952691]]],"depthLimitRange":[-10000000000,10000000000],"type":1,"texId":0,"texPath":"http://192.168.31.6:9012/DownloadService/blackHole3D/files/Download/3a18de5e-eaf5-569c-b021-fe6eefcbca5c?token=E83D87E8E84D8248348B48C58E189984E8198DC85284A8&timestamp=1768461970199","texSize":[5,5]}',
                            treeNodeIds: { '3a1ed2b9-afd3-5b82-b437-5285a1835f25': true },
                            depthLimitRange: null,
                        },
                        monomerizationInfo: null,
                        hasRvtGroup: false,
                        fileIntId: null,
                        uniqueId: null,
                        formatType: 0,
                        enableLazyLoading: false,
                        subNodes: [],
                        lastModificationTime: '2026-01-15T15:30:09.529',
                        creationTime: '2026-01-15T15:27:47.238',
                        customNodeType: 'dataSet',
                        nodeId: '3a1ed2ba-7e26-d328-0ae5-70d6ba873de0',
                        nodeName: '开挖区域-20260115152732',
                        extrudeId: '3a1ed2ba-7dea-879e-2179-c829972af9b8',
                    },
                ],
                lastModificationTime: '2026-01-15T15:30:09.529',
                creationTime: '2026-01-15T15:27:47.218',
                nodeName: '开挖',
                nodeId: '3a1ed2ba-7e12-e643-1181-420c3b6c293e',
            },
            {
                projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                dataSetId: '00000000-0000-0000-0000-000000000000',
                dataSetType: 25,
                srcDataSetType: 25,
                srcDataSetId: '00000000-0000-0000-0000-000000000000',
                sceneNodeId: '3a1ed2bc-6ebe-ba92-bf9e-69328719b7f9',
                sceneNodeName: '单体化',
                parentId: '00000000-0000-0000-0000-000000000000',
                levelCode: '3a1ed2bc-6ebe-ba92-bf9e-69328719b7f9',
                levelPathName: '单体化',
                nodeType: 3,
                viewStatus: 0,
                status: null,
                hasTexture: false,
                coordinates: null,
                hasUpdated: false,
                isTouchDown: false,
                isDigHole: false,
                lod: 0,
                visibleDistance: 0,
                sortNum: 0,
                isNew: false,
                disableReason: null,
                systemLodConfig: null,
                componentInfo: null,
                waterInfo: null,
                excavateInfo: null,
                monomerizationInfo: null,
                hasRvtGroup: false,
                fileIntId: null,
                uniqueId: null,
                formatType: 0,
                enableLazyLoading: false,
                subNodes: [
                    {
                        projId: '3a1d16e5-3dc2-006d-48a0-c1d412f81948',
                        dataSetId: '3a1ed2bc-6e9f-d11b-2d16-a5507fbf9390',
                        dataSetType: 25,
                        srcDataSetType: 25,
                        srcDataSetId: '3a1ed2bc-6e9f-d11b-2d16-a5507fbf9390',
                        sceneNodeId: '3a1ed2bc-6ecb-f79f-35cc-219ba1513055',
                        sceneNodeName: '单体化-20260115152808',
                        parentId: '3a1ed2bc-6ebe-ba92-bf9e-69328719b7f9',
                        levelCode: '3a1ed2bc-6ebe-ba92-bf9e-69328719b7f9/3a1ed2bc-6ecb-f79f-35cc-219ba1513055',
                        levelPathName: '单体化/单体化-20260115152808',
                        nodeType: 2,
                        viewStatus: 0,
                        status: null,
                        hasTexture: false,
                        coordinates: null,
                        hasUpdated: false,
                        isTouchDown: false,
                        isDigHole: false,
                        lod: 0,
                        visibleDistance: 0,
                        sortNum: 0,
                        isNew: false,
                        disableReason: null,
                        systemLodConfig: null,
                        componentInfo: null,
                        waterInfo: null,
                        excavateInfo: null,
                        monomerizationInfo: {
                            topHeight: -35.56,
                            bottomHeight: -46.63,
                            level: 2,
                            expansion: 0.1,
                            spaceNumPerUnit: 1,
                            displayMode: 1,
                            monomerizationType: 2,
                            regionJson:
                                '{"monomerId":"Monomer_1768462100524","dataSetId":"3a1d16e5aa9f9da2e5ba6c396f52b4cd","rgnList":[[[151.741184592247,-144.10178995132446,-46.629999999999995],[179.84178192168474,-130.58751997351646,-46.629999999999995],[161.70980349183083,-70.57454866170883,-46.629999999999995],[128.49000389873981,-83.57777436822653,-46.629999999999995]]],"heightMin":-200,"heightMax":200,"faceClr":{"red":255,"green":255,"blue":255,"alpha":127},"lineClr":{"red":255,"green":255,"blue":255,"alpha":127},"expandDist":0,"showState":0}',
                            isBindModel: true,
                            dataSetId: '3a1d16e5-aa9f-9da2-e5ba-6c396f52b4cd',
                            levelJson: [
                                {
                                    id: '3a1ed2bc-6ea4-98d8-9a9d-12b6cb72b194',
                                    name: '1',
                                    floors: [
                                        {
                                            id: '3a1ed2bc-6ea4-621e-c3fb-3c95cf76d5b4',
                                            name: '1层',
                                            rooms: [
                                                {
                                                    id: '3a1ed2bc-6ea4-4184-e2f7-c7fe3baeab04',
                                                    name: '1',
                                                    geoJson:
                                                        '{"dataSetId":"3a1d16e5aa9f9da2e5ba6c396f52b4cd","rgnList":[[[128.49000389873981,-83.57777436822653,-46.63],[161.70980349183083,-70.57454866170883,-46.63],[171.41275642704832,-102.68924802525306,-46.63],[140.28954105332934,-114.29257461994642,-46.63]]],"heightMin":-46.63,"heightMax":-41.09,"monomerClr":{"red":7,"green":127,"blue":254,"alpha":128}}',
                                                    attrs: [
                                                        { attrKey: '恶法大师傅', attrValue: '非官方大哥' },
                                                        { attrKey: '共和国和', attrValue: '和规范化' },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            id: '3a1ed2bc-6ea4-117d-ecf6-3633484566f4',
                                            name: '2层',
                                            rooms: [
                                                {
                                                    id: '3a1ed2bc-6ea4-4deb-6ab4-e88ec578921c',
                                                    name: '1',
                                                    geoJson:
                                                        '{"dataSetId":"3a1d16e5aa9f9da2e5ba6c396f52b4cd","rgnList":[[[128.49000389873981,-83.57777436822653,-46.63],[161.70980349183083,-70.57454866170883,-46.63],[171.41275642704832,-102.68924802525306,-46.63],[140.28954105332934,-114.29257461994642,-46.63]]],"heightMin":-41.09,"heightMax":-35.550000000000004,"monomerClr":{"red":7,"green":127,"blue":254,"alpha":128}}',
                                                    attrs: [
                                                        { attrKey: '恶法大师傅', attrValue: '豆腐' },
                                                        { attrKey: '共和国和', attrValue: '苟富贵' },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    id: '3a1ed2bc-6ea4-fb6e-2f46-5254ce50202c',
                                    name: '2',
                                    floors: [
                                        {
                                            id: '3a1ed2bc-6ea4-2de0-eb83-e35022218083',
                                            name: '1层',
                                            rooms: [
                                                {
                                                    id: '3a1ed2bc-6ea4-e803-169d-f9df5ada836d',
                                                    name: '1',
                                                    geoJson:
                                                        '{"dataSetId":"3a1d16e5aa9f9da2e5ba6c396f52b4cd","rgnList":[[[151.741184592247,-144.10178995132446,-46.63],[140.28954105332934,-114.29257461994642,-46.63],[171.41275642704832,-102.68924802525306,-46.63],[179.84178192168474,-130.58751997351646,-46.63]]],"heightMin":-46.63,"heightMax":-41.09,"monomerClr":{"red":9,"green":182,"blue":109,"alpha":128}}',
                                                    attrs: [
                                                        { attrKey: '恶法大师傅', attrValue: '0-0' },
                                                        { attrKey: '共和国和', attrValue: '就看见' },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            id: '3a1ed2bc-6ea4-5ddc-f5d0-6434f8043f55',
                                            name: '2层',
                                            rooms: [
                                                {
                                                    id: '3a1ed2bc-6ea4-97d5-ab7a-e82ccbe41cec',
                                                    name: '1',
                                                    geoJson:
                                                        '{"dataSetId":"3a1d16e5aa9f9da2e5ba6c396f52b4cd","rgnList":[[[151.741184592247,-144.10178995132446,-46.63],[140.28954105332934,-114.29257461994642,-46.63],[171.41275642704832,-102.68924802525306,-46.63],[179.84178192168474,-130.58751997351646,-46.63]]],"heightMin":-41.09,"heightMax":-35.550000000000004,"monomerClr":{"red":9,"green":182,"blue":109,"alpha":128}}',
                                                    attrs: [
                                                        { attrKey: '恶法大师傅', attrValue: '676' },
                                                        { attrKey: '共和国和', attrValue: '343' },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        hasRvtGroup: false,
                        fileIntId: null,
                        uniqueId: null,
                        formatType: 0,
                        enableLazyLoading: false,
                        subNodes: [{ nodeId: 'tempNode-3a1ed2bc-6ecb-f79f-35cc-219ba1513055', nodeName: '', viewStatus: 0 }],
                        lastModificationTime: '2026-01-15T15:30:09.529',
                        creationTime: '2026-01-15T15:29:54.379',
                        customNodeType: 'monomer',
                        nodeId: '3a1ed2bc-6ecb-f79f-35cc-219ba1513055',
                        nodeName: '单体化-20260115152808',
                        monomerId: '3a1ed2bc-6ecb-f79f-35cc-219ba1513055',
                        monomerName: '单体化-20260115152808',
                    },
                ],
                lastModificationTime: '2026-01-15T15:30:09.529',
                creationTime: '2026-01-15T15:29:54.366',
                nodeName: '单体化',
                nodeId: '3a1ed2bc-6ebe-ba92-bf9e-69328719b7f9',
            },
        ],
        isResponse: false,
        msgId: '',
        type: 'updateTreeData',
    };

    // setTimeout(() => {
    //     handle_appToWebMsg(msgData);
    // }, 1000);
    // setTimeout(() => {
    //     handle_appToWebMsg(msgData2);
    // }, 2000);
});

// MARK App->Web 接收App消息
const handle_appToWebMsg = (msgData: any) => {
    if (msgData) {
        console.log('msgData: ', msgData);
        if (msgData.type == 'Listen.systemSelElement') {
            listen_selElem(msgData.data);
            ui_initData();
        } else if (msgData.type == 'Listen.systemSelShpElement') {
            listen_selShpElem(msgData.data);
            ui_initData();
        } else if (msgData.type == 'updateTreeData') {
            treeList.value = msgData.data;
        }
    } else {
        ui_initData();
    }
};

// MARK UI 初始化数据
const ui_initData = () => {
    modelAttrList_basic.value = [];
    modelAttrList_extend.value = [];
    shpAttrList.value = [];
    entityAttrTypeList.value = [];
    entityAttrList.value = [];
};

// MARK Listen 构件点击事件
const listen_selElem = (re_selInfo: any) => {
    if (re_selInfo.dataSetType == 0) {
        propertyType.value = 1;
        server_getAttrData_model(re_selInfo);
    } else {
        propertyType.value = 2;
        server_getAttrData_entity(re_selInfo);
    }
};

// MARK Listen 矢量点击事件
const listen_selShpElem = (re_selInfo: any) => {
    if (re_selInfo.probeInfo.elemIdStr.includes('Monomer')) {
        propertyType.value = 4;
        const monomerNode = server_getMonomerNode(re_selInfo.probeInfo.elemIdStr);
        if (monomerNode) {
            const monomerAttrs = server_getAttrData_monomer(monomerNode);
            handle_monomerData(monomerAttrs);
        }
    } else {
        propertyType.value = 3;
        server_getAttrData_shp(re_selInfo);
    }
};

// MARK Server 获取模型构件属性
const server_getAttrData_model = (re_selModel: any) => {
    let params = {
        dataSetId: re_selModel.probeInfo.dataSetId,
        elementIntId: re_selModel.probeInfo.elemId,
        isQueryExtend: true,
    };
    instance?.proxy.$showLoading();
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

    instance?.proxy.$showLoading();
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
    instance?.proxy.$showLoading();
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
    instance?.proxy.$hideLoading();
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
            if (res) {
                resolve(res);
            } else {
                reject(null);
            }
        });
    });
};

// MARK Server 获取单体化节点数据
const server_getMonomerNode = (elemId: any) => {
    const leafNodes = handle_findAllNodeByLevel(treeList.value, 2);
    let monomerNodes = leafNodes.filter((el: any) => el.dataSetType === 25);

    let findMonomerNode = monomerNodes.find((item: any) => elemId.includes(item.monomerId));
    if (findMonomerNode) return findMonomerNode;

    instance?.proxy.$showLoading();
    monomerNodes = monomerNodes.filter((el: any) => el.customNodeType === 'monomer');
    monomerNodes.forEach((monomerNode: any) => {
        const monomerInfo = monomerNode.monomerizationInfo;
        const units = monomerInfo.levelJson;
        units.forEach((unit: any) => {
            const floors = unit.floors;
            floors.forEach((floor: any) => {
                const rooms = floor.rooms;
                let find = rooms.find((room: any) => elemId.includes(room.id));
                if (find) {
                    if (monomerInfo.monomerizationType === 1) {
                        findMonomerNode = Tool.data_deepClone(monomerNode);
                    } else {
                        findMonomerNode = Tool.data_deepClone(find);
                        findMonomerNode.customNodeType = 'monomerRoom';
                        findMonomerNode.monomerName = monomerNode.monomerName;
                        findMonomerNode.monomerId = find.id;
                        findMonomerNode.nodeName = `${unit.name}单元${floor.name}${find.name}户`;
                        findMonomerNode.displayMode = monomerInfo.displayMode;
                        findMonomerNode.dataSetId = monomerInfo.dataSetId;
                        findMonomerNode.dataSetType = monomerNode.dataSetType;
                    }
                }
            });
        });
    });
    instance?.proxy.$hideLoading();
    return findMonomerNode;
};

// MARK Server 获取单体化属性
const server_getAttrData_monomer = (monomerNode: any) => {
    let attrs: any[] = [];
    attrs = [{ attrKey: '单体化名称', attrValue: monomerNode.monomerName }];

    if (monomerNode.customNodeType === 'monomer') {
        const monomerInfo = monomerNode.monomerizationInfo;
        if (monomerInfo.monomerizationType === 1) {
            const units = monomerInfo.levelJson;
            const roomInfo = units[0]?.floors[0]?.rooms[0];
            // attrs.push({ attrKey: '房间号', attrValue: monomerNodeInfo.nodeName })
            if (roomInfo?.attrs) {
                attrs = [...attrs, ...roomInfo.attrs];
            }
        }
        return attrs;
    }
    attrs.push({ attrKey: '房间号', attrValue: monomerNode.nodeName });

    if (monomerNode.customNodeType === 'monomerRoom') {
        attrs = [...attrs, ...monomerNode.attrs];
    }
    return attrs;
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
        console.log('entityAttrList: ', entityAttrList.value);
    }
};

// MARK Data 处理矢量属性
const handle_shpData = (shpData: any) => {
    shpAttrList.value = [];
    shpData.forEach((el: any) => {
        let paransData: any = {
            paramName: el.key,
            paramValue: el.value,
        };
        shpAttrList.value.push(paransData);
    });
};

// MARK Data 处理属性显示数据 - 单体化
const handle_monomerData = (attrs: any) => {
    shpMoreAttrList.value = [];
    let monomerAttrs: any[] = [];
    attrs.forEach((el: any) => {
        let paransData: any = {
            paramName: el.attrKey,
            paramValue: el.attrValue,
        };
        monomerAttrs.push(paransData);
    });
    // 因为单体化只有一组的属性显示，将数据限制在一个组中，方便多组的组件显示
    shpMoreAttrList.value.push({
        paramGroup: '文件信息',
        paramDatas: monomerAttrs,
    });
    console.log('shpMoreAttrList: ', shpMoreAttrList.value);
};

// MARK data 查找-节点级别数据
const handle_findAllNodeByLevel = (nodeData: any, level: number) => {
    const array: any = [];

    const traverse = (item: any) => {
        if (item.nodeType && item.nodeType === level) {
            array.push(item);
        }
        if (item.subNodes && item.subNodes.length) {
            item.subNodes.forEach((subNode: any) => {
                traverse(subNode);
            });
        }
    };

    nodeData.forEach((item: any) => {
        traverse(item);
    });

    return array;
};

// MARK Callback el-select 选择回调
const elselect_change = async (e: any) => {
    const findObj = re_selModel_cur.value.entityList.find((el: any) => el.elemId == re_selModel_cur.value.probeInfo.elemId);
    if (!findObj) return;
    let params_info = {
        dataSetId: findObj.dataSetId,
        dataSetType: re_selModel_cur.value.dataSetType,
        hostFileId: Number(findObj.entityType),
        id: findObj.entityId,
        paramType: e,
    };
    instance?.proxy.$showLoading();
    const res_attr = await server_getAttrData_entity_info(params_info);
    instance?.proxy.$hideLoading();
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
