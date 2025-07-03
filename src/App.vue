<!--
 * @Author: Lemon C
 * @Date: 2025-07-02 11:25:16
 * @LastEditTime: 2025-07-03 11:36:20
-->
<template>
    <router-view />
</template>

<style lang="scss">
@import url('./assets/common/iconfont.css');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
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
}
:root {
    --color-white: #ffffff;
    --color-main-bg: #f9f9f9;
    --color-main-blue: #0052d9;
    --color-main-black: #1d2129;
    --color-main-gray: #86909c;
    --animation-transform-style: transform 0.3s linear;
    --animation-opacity-style: opacity 0.5s ease-in-out;
}
</style>
