<template>
    <div class="property-entity-area">
        <attr-select class="attr-select-area" :select_list="select_list" :elselect_change="elselect_change"></attr-select>
        <attr-scroll-table :attr_list="attr_list"></attr-scroll-table>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { PropType, ref } from 'vue';
import AttrSelect from './AttrSelect.vue';
import AttrScrollTable from './AttrScrollTable.vue';

const pros = defineProps({
    select_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    attr_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    elselect_change: Function,
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.property-entity-area {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .attr-select-area {
        position: relative;
        height: 32px;
        margin-bottom: 10px;
    }
}
</style>
