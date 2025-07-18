<!--
 * @Author: Lemon C
 * @Date: 2025-07-11 15:48:00
 * @LastEditTime: 2025-07-17 17:43:21
-->
<template>
    <div class="property-shp-area">
        <attr-table :table_list="attr_list"></attr-table>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, PropType } from 'vue';
import AttrTable from './AttrTable.vue';

const props = defineProps({
    attr_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.property-shp-area {
    position: relative;
    height: 100%;
    overflow-y: auto;

    .attr-table-area {
        border-top: 1px solid #5c5c5c;
        border-bottom: 1px solid #5c5c5c;
    }
}
</style>
