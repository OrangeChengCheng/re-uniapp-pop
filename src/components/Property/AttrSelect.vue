<template>
    <div class="sup-attr-select-area">
        <div class="select-box" ref="ref_selectBox">
            <div class="select-title">类型：</div>
            <el-select v-model="currParamType" :append-to="ref_selectBox" :show-arrow="false" @change="elselect_change">
                <el-option v-for="(item, index) in select_list" :key="index" :label="item.paramsType" :value="item.paramsType" />
            </el-select>
        </div>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, PropType, watch } from 'vue';

const ref_selectBox = ref<HTMLElement | null>(null);

const props = defineProps({
    select_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    elselect_change: Function,
});

const currParamType = ref('');

watch(
    () => props.select_list,
    () => {
        if (props.select_list.length) {
            currParamType.value = props.select_list[0]?.paramsType;
        }
    }
);
</script>

// MOD-- CSS
<style lang="scss" scoped>
.sup-attr-select-area {
    position: relative;
    width: 100%;
    display: flex;
    font-size: 14px;
    color: white;

    :deep(.select-box) {
        position: relative;
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;

        .select-title {
            position: relative;
            width: 50px;
            display: flex;
            flex-shrink: 0;
        }

        .el-select {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 8px;
            overflow: hidden;

            .el-select__wrapper {
                background-color: transparent;
                box-shadow: unset !important;
                border: 1px solid #5c5c5c !important;
                border-radius: 8px;

                .el-select__selected-item {
                    color: white;
                }
            }
        }
        .el-popper {
            // display: block !important;
            margin-top: -5px;
            border-radius: 8px;
            background: #2c2c2c !important;
            border: 1px solid #5c5c5c;

            .el-select-dropdown {
                border-radius: 8px;
            }
            .el-select-dropdown__item {
                color: white;
                font-weight: normal;
                height: 32px;
            }
            .el-select-dropdown__item.is-hovering {
                background-color: transparent;
            }
        }
    }
}
</style>
