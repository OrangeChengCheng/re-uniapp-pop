<!--
 * @Author: Lemon C
 * @Date: 2025-07-03 11:44:27
 * @LastEditTime: 2026-04-29 18:30:25
-->
<template>
    <transition name="slide-up-down" :class="{ 'disable-transition': disableTransition }" @after-leave="tran_after_leave">
        <div v-show="popViewShow" class="sup-base-view">
            <div class="cloose-area" @click="cloose_click">
                <img :src="require('@/assets/img/icon_down.png')" />
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
import { useStateStore } from '@/stores/state';
import VConsole from 'vconsole';

const state_store = useStateStore();

const props = defineProps({
    base_appTpWebMsg_callback: Function,
});

const NativeBridge = (window as any).$reapi;

const popViewShow = ref(false);
const disableTransition = ref(false); //控制是否禁用过渡动画的开关
const isFullScreen = ref(false);
const currWebPopId = ref('');

onMounted(() => {
    NativeBridge.registerAppMsg(handle_appToWebMsg);
    if (window.pcDebug) {
        openView();
    }
    if (window.isOffline) {
        new VConsole();
    }
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
                currWebPopId.value = appData.data.webPopId;
            } else if (appData.type === 'cloose') {
                cloose_click();
            }
        }
    }
};

// MARK transition 监听动画完成
const tran_after_leave = () => {
    if (!isFullScreen.value) {
        NativeBridge.cloose({ webPopId: currWebPopId.value });
    }
};

// MARK 打开视图并触发动画
const openView = () => {
    popViewShow.value = true;
};

// MARK Click 关闭视图并触发动画
const cloose_click = () => {
    popViewShow.value = false;
};

// MARK 全屏
const fullScreen = () => {
    isFullScreen.value = true;
    disableTransition.value = true;
    cloose_click();
    setTimeout(() => {
        disableTransition.value = false;
        openView();
        isFullScreen.value = false;
    }, 100);
};

// MARK 暴露方法给父组件
defineExpose({
    fullScreen,
});
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

.disable-transition {
    transition: none !important; /* 强制取消过渡 */
}

.cloose-area {
    position: relative;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;

    img {
        position: relative;
        margin-top: 5px;
        width: 40px;
        height: 15px;
        filter: invert(1);
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
