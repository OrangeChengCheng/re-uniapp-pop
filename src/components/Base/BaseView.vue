<!--
 * @Author: Lemon C
 * @Date: 2025-07-03 11:44:27
 * @LastEditTime: 2025-07-07 15:19:33
-->
<template>
    <div class="sup-base-view">
        <div class="cloose-area" @click="cloose_click">
            <div class="cloose-line"></div>
        </div>
        <view class="base-solt">
            <slot></slot>
        </view>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
const props = defineProps({
    base_cloose_callback: Function,
});

const NativeBridge = (window as any).$reapi;

const cloose_click = () => {
    if (props.base_cloose_callback) {
        props.base_cloose_callback();
    }
    NativeBridge.cloose();
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-base-view {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    flex-direction: column;
    overflow: hidden;
    background-color: rgba($color: #23252b, $alpha: 0.9);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

.cloose-area {
    position: relative;
    width: 100%;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    .cloose-line {
        position: relative;
        margin-top: 6px;
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
