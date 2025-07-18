<!--
 * @Author: Lemon C
 * @Date: 2025-07-15 10:47:52
 * @LastEditTime: 2025-07-17 17:45:08
-->
<template>
    <div class="attr-table-area">
        <div v-for="(val, index) in table_list" :key="index" class="table-item-box">
            <div class="label-box">{{ val.paramName }}</div>
            <div class="value-box">{{ computed_paramValue(val) }}</div>
        </div>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, PropType, computed } from 'vue';

const props = defineProps({
    table_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
});

const computed_paramValue = computed(() => (data: any) => {
    let valueStr = '';
    if (data.paramValue && data.paramValue.length) {
        valueStr += data.paramValue;
    }
    if (data.paramType && data.paramType.length) {
        valueStr += data.paramType;
    }
    return valueStr;
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.attr-table-area {
    width: 100%;
    // max-height: 100%;
    font-size: 12px;

    .table-item-box {
        position: relative;
        min-height: 35px;
        display: grid;
        grid-template-columns: 1fr 2fr;
        text-align: left;
        border-bottom: 1px solid #5c5c5c;

        &:last-child {
            border-bottom: none;
        }

        .label-box {
            display: flex;
            align-items: center;
            word-break: break-all;
            padding: 4px 0px 4px 24px;
            color: white;
            border-left: 1px solid #5c5c5c;
            border-right: 1px solid #5c5c5c;
        }

        .value-box {
            display: flex;
            align-items: center;
            word-break: break-all;
            padding: 4px 4px 4px 8px;
            color: white;
            border-right: 1px solid #5c5c5c;
        }
    }
}
</style>
