<!--
 * @Author: Lemon C
 * @Date: 2025-07-03 11:44:27
 * @LastEditTime: 2025-07-28 17:04:46
-->
<template>
    <transition name="slide-up-down" @after-leave="tran_after_leave">
        <div v-show="popViewShow" class="sup-base-view">
            <div class="cloose-area" @click="cloose_click">
                <div class="cloose-line"></div>
            </div>
            <view class="base-solt">
                <slot></slot>
            </view>
        </div>
    </transition>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
    base_appTpWebMsg_callback: Function,
});

const NativeBridge = (window as any).$reapi;

const popViewShow = ref(false);

onMounted(() => {
    NativeBridge.registerAppMsg(handle_appToWebMsg);
});

// MARK App->Web 接收App消息
const handle_appToWebMsg = (msgData: any) => {
    console.log('收到 移动端 消息:', msgData);
    if (msgData) {
        const appData = JSON.parse(msgData);
        if (appData.type) {
            if (props.base_appTpWebMsg_callback) {
                props.base_appTpWebMsg_callback(appData);
            }

            if (appData.type === 'open') {
                openView();
            } else if (appData.type === 'close') {
                cloose_click();
            }
        }
    }
};

// MARK transition 监听动画完成
const tran_after_leave = () => {
    NativeBridge.cloose();
};

// MARK 打开视图并触发动画
const openView = () => {
    popViewShow.value = true;
};

// MARK Click 关闭视图并触发动画
const cloose_click = () => {
    popViewShow.value = false;
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-base-view {
    position: absolute;
    display: flex;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
    overflow: hidden;
    background-color: rgba($color: #23252b, $alpha: 0.9);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    transition: transform 0.5s ease-out;
}

.slide-up-down-enter-active,
.slide-up-down-leave-active {
    transition: transform 0.5s ease-out;
}

.slide-up-down-enter-from,
.slide-up-down-leave-to {
    transform: translateY(100%);
}

.slide-up-down-enter-to,
.slide-up-down-leave-from {
    transform: translateY(0);
}

.cloose-area {
    position: relative;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;

    .cloose-line {
        position: relative;
        margin-top: 10px;
        width: 40px;
        height: 4px;
        border-radius: 2px;
        background-color: white;
    }
}

.base-solt {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
