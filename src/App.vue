<!--
 * @Author: Lemon C
 * @Date: 2025-07-02 11:25:16
 * @LastEditTime: 2025-07-18 10:19:26
-->
<template>
    <router-view />
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const NativeBridge = (window as any).$reapi;

onMounted(() => {
    NativeBridge.webInit();
    NativeBridge.getInitUrlParam();
});
</script>

<style lang="scss">
@import url('./assets/common/iconfont.css');
// @import '@/assets/css/pubilc.css';

// 修改全局滚动条样式
::-webkit-scrollbar {
    width: 0;
    /*对垂直流动条有效*/
    height: 0px;
    /*对水平流动条有效*/
}

/*定义滚动条的轨道颜色、内阴影及圆角*/
::-webkit-scrollbar-track {
    background-color: var(--color-main-scrollbar-track);
    border-radius: unset;
}

/*定义滑块颜色、内阴影及圆角*/
::-webkit-scrollbar-thumb {
    border-radius: 0px;
    box-shadow: var(--color-main-scrollbar-thumb-box-shadow);
    -webkit-box-shadow: var(--color-main-scrollbar-thumb-box-shadow);
    background-color: var(--color-main-scrollbar-thumb);
}

/*定义两端按钮的样式*/
::-webkit-scrollbar-button {
    display: none;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent; //禁用移动端特有的点击高亮效果
}

html,
body {
    width: 100vw;
    height: 100vh;
    position: relative;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    &::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
    }
}
#app {
    font-family: SourceHanSansCN, SourceHanSansCN;
    font-weight: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100vw;
    height: 100vh;
    // background-color: rgba($color: #5d87b3, $alpha: 1);
}
:root {
    --color-white: #ffffff;
    --color-main-bg: #f9f9f9;
    --color-main-blue: #0052d9;
    --color-main-black: #1d2129;
    --color-main-gray: #86909c;
    --animation-transform-style: transform 0.3s linear;
    --animation-opacity-style: opacity 0.5s ease-in-out;

    // 下拉框
    --search-label-text-color: #fff;
    --search-inner-text-color: #fff;
    --search-inner-border-color: rgba(255, 255, 255, 0.15);
    --search-inner-bg-color: #2c2c2c;
    --select-poper-border-color: rgba(255, 255, 255, 0.15);
    --select-poper-item-bgColor: rgba(255, 255, 255, 0.1);
    --select-poper-item-active-bgColor: rgba(37, 128, 255, 0.1);
    --select-poper-item-text-color: #fff;
    --select-poper-item-border-right-color: #48494c;
    --select-poper-arrow-color: #c0c4cc;
    --select-poper-label-color: #fff;
    --select-poper-label-hover-bgcolor: rgba(255, 255, 255, 0.05);
    --select-poper-label-active-bgcolor: rgba(255, 255, 255, 0.1);
    --select-poper-label-select-bgcolor: rgba(37, 128, 255, 0.1);
    --select-poper-label-select-color: #2580ff;
}
</style>
