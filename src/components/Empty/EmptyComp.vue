<!--
 * @Author: Lemon C
 * @Date: 2025-07-17 16:45:11
 * @LastEditTime: 2025-12-11 15:09:42
-->
<template>
    <div class="sup-empty-comp">
        <div class="empty-img-area">
            <img :src="require('@/assets/img/no-data.png')" />
        </div>
        <div class="empty-title-area">{{ empty_title }}</div>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    empty_title: {
        type: String,
        default: '暂无数据',
    },
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-empty-comp {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;

    .empty-img-area {
        position: relative;
        max-width: 200px;
        max-height: 100px;
        margin-top: -50px;

        img {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
