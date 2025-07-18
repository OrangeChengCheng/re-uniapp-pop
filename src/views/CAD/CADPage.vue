<template>
    <base-view>
        <div class="cad-container">
            <button @click="sendMessageToMobileCloose()">关闭【图纸弹窗】</button>
            <div>Web 与 移动端 通信示例</div>
            <div class="message"><strong>接收【初始化消息】:</strong> {{ initAppToWebMsg }}</div>
            <div class="message"><strong>接收【发送消息】:</strong> {{ mobileMessage }}</div>
            <button @click="click_showCad()">{{ isShowCad ? '关闭查看图纸' : '查看图纸' }}</button>
            <button @click="sendMessageToMobile()">发送到 移动端</button>
            <button @click="setModelColor()">设置模型构件颜色</button>
            <button @click="resetModelColor()">重置模型构件颜色</button>
            <button @click="clearModelSel()">清空选择集</button>
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

// 发送消息到 移动端
const sendMessageToMobile = () => {
    let sendData = {
        type: 'sendMsg',
        data: {
            aaa: [
                {
                    bbb: 'https://www.baidu.com',
                    ccc: true,
                    ddd: {
                        eee: [1, 2, 3],
                    },
                    fff: 666,
                },
            ],
            hhh: false,
            ggg: 888,
            iii: {
                jjj: 'abc',
                kkk: [6, 5, 4],
            },
        },
    };
    NativeBridge.sendMsgWebToApp(sendData);
    console.log('已发送消息到 移动端:', JSON.stringify(sendData));
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
    NativeBridge.resetModelColor({
        dataSetId: 'res_hushizhan',
        elemIdList: [22], // 空数组代表整个数据集
    });
};
const clearModelSel = () => {
    NativeBridge.clearModelSel();
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
