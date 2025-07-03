<!--
 * @Author: Lemon C
 * @Date: 2025-07-03 11:44:27
 * @LastEditTime: 2025-07-03 11:46:27
-->
<template>
    <div class="sup-base-view">
        <view class="base-solt">
            <slot></slot>
        </view>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref } from 'vue';
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
}

.base-solt {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
