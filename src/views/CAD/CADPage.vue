<template>
    <base-view>
        <div class="cad-container">
            <button @click="sendMessageToMobileCloose()">关闭【图纸弹窗】</button>
            <div>Web 与 移动端 通信示例</div>
            <div class="message"><strong>接收【初始化消息】:</strong> {{ initAppToWebMsg }}</div>
            <div class="message"><strong>接收【发送消息】:</strong> {{ mobileMessage }}</div>
            <button @click="click_showCad()">{{ isShowCad ? '关闭查看图纸' : '查看图纸' }}</button>
            <button @click="setModelColor()">设置模型构件颜色</button>
            <button @click="resetModelColor()">重置模型构件颜色</button>
            <button @click="clearModelSel()">清空选择集</button>
            <button @click="click_setModelVisible()">{{ modelVisible ? '隐藏模型' : '显示模型' }}</button>
            <button @click="click_setModelAlpha()">设置模型构件透明度</button>
            <button @click="click_locDataSet()">相机定位数据集</button>
            <button @click="click_locElem()">相机定位构件</button>
            <button @click="click_setLoc()">相机定位目标方位</button>
            <button @click="click_getLoc()">获取相机信息</button>
            <button @click="click_getDataSetBBox()">获取包围盒信息</button>
        </div>
    </base-view>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseView from '@/components/Base/BaseView.vue';

const NativeBridge = (window as any).$reapi;

const initAppToWebMsg = ref('');
const mobileMessage = ref('');
const modelVisible = ref(true);
const isShowCad = ref(false);

onMounted(() => {
    NativeBridge.registerAppMsg(handleMobileMessage);
    // NativeBridge.getInitUrlParam();
});

// 处理从 移动端 接收的消息
const handleMobileMessage = (message: any) => {
    console.log('收到 移动端 消息:', message);
    // 更新 Vue 状态或执行其他操作
    mobileMessage.value = message;
};

const sendMessageToMobileCloose = () => {
    NativeBridge.cloose();
};

const click_showCad = () => {
    isShowCad.value = !isShowCad.value;
    NativeBridge.popWebFull(isShowCad.value);
};

const setModelColor = () => {
    NativeBridge.setModelColor({
        dataSetId: 'res_hushizhan',
        elemIdList: [22], // 空数组代表整个数据集
        elemClr: [255, 0, 0, 255], //构件颜色 rgba
    });
};
const resetModelColor = () => {
    NativeBridge.resetElemAttr({
        dataSetId: 'res_hushizhan',
        elemIdList: [22], // 空数组代表整个数据集
    });
};
const clearModelSel = () => {
    NativeBridge.delAllSelElems();
};
const click_setModelAlpha = () => {
    NativeBridge.setModelAlpha({
        alpha: 128,
        dataSetId: 'res_hushizhan',
        elemIdList: [22],
    });
};
const click_setModelVisible = () => {
    modelVisible.value = !modelVisible.value;
    NativeBridge.setModelVisible({
        visible: modelVisible.value,
        dataSetId: 'res_hushizhan',
        elemIdList: [22],
    });
};
const click_locDataSet = () => {
    NativeBridge.locDataSet({
        dataSetId: 'res_hushizhan',
        backDepth: 1.0,
    });
};
const click_setLoc = () => {
    NativeBridge.setCamLocTo({
        camPos: [12654914.48635184, 4130009.3671415593, 17.31782443427872],
        camRotate: [0.36157101126036134, -0.1404893305387332, -0.3338153488477842, 0.8591254068496466],
        camDir: [0.4827918130284945, 0.5274746945418344, -0.6990583036418765],
        locDelay: 0,
        locTime: 0,
    });
};
const click_getLoc = () => {
    const camLoc = NativeBridge.getCamLocInfo();
    console.log(`camLoc: ${JSON.stringify(camLoc)}`);
};
const click_locElem = () => {
    NativeBridge.locElem({
        locIDList: [
            {
                dataSetId: 'res_hushizhan',
                elemIdList: [22],
            },
        ],
        backDepth: 1.0,
    });
};
const click_getDataSetBBox = async () => {
    const data = await NativeBridge.getBIMDataSetBV({ dataSetId: 'res_hushizhan' });

    console.log('----');
    console.log(JSON.stringify(data));
    console.log('----');
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.cad-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    // background-color: red;
    overflow: auto;
    // padding-bottom: 50px;

    button,
    div {
        position: relative;
        margin-top: 20px;
    }
}
</style>
