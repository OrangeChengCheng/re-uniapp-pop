<!--
 * @Author: Lemon C
 * @Date: 2026-01-15 18:06:28
 * @LastEditTime: 2026-01-15 18:07:38
-->
<template>
    <div class="property-shp-more-area">
        <attr-scroll-table :attr_list="attr_list"></attr-scroll-table>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { PropType, ref } from 'vue';
import AttrScrollTable from './AttrScrollTable.vue';

const pros = defineProps({
    attr_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.property-shp-more-area {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
</style>
