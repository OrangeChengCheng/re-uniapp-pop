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
        margin-top: -50px;
    }
}
</style>
