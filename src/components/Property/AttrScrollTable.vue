<!--
 * @Author: Lemon C
 * @Date: 2025-07-14 15:46:06
 * @LastEditTime: 2025-08-07 10:09:47
-->
<template>
    <div class="property-model-area">
        <el-scrollbar v-if="attr_list.length">
            <el-collapse v-model="activeNames" :expand-icon-position="'left'">
                <el-collapse-item :name="item.paramGroup" :title="item.paramGroup" v-for="(item, index) in attr_list" :key="index">
                    <attr-table :table_list="item.paramDatas"></attr-table>
                </el-collapse-item>
            </el-collapse>
        </el-scrollbar>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, onMounted, PropType, watch } from 'vue';

import AttrTable from './AttrTable.vue';

const props = defineProps({
    attr_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
});

const activeNames = ref<any[]>([]);

watch(
    () => props.attr_list,
    () => {
        activeNames.value = [];
        props.attr_list.forEach((item: any, index: number) => {
            activeNames.value.push(item.paramGroup);
        });
    }
);

onMounted(() => {
    activeNames.value = [];
    props.attr_list.forEach((item: any, index: number) => {
        activeNames.value.push(item.paramGroup);
    });
});
</script>

// MOD-- CSS
<style lang="scss" scoped>
.property-model-area {
    position: relative;
    height: 100%;

    :deep(.el-scrollbar) {
        position: relative;
    }

    :deep(.el-collapse) {
        position: relative;
        // border: 1px solid #5c5c5c;
        border-top: 1px solid #5c5c5c;

        .el-collapse-item {
            color: white !important;
            .el-collapse-item__header {
                color: white;
                // border-top: 1px solid #5c5c5c;
                border-bottom: 1px solid #5c5c5c;
                border-left: 1px solid #5c5c5c;
                border-right: 1px solid #5c5c5c;
                height: 35px;
                background-color: #252525 !important;
                overflow: hidden;

                .el-collapse-item__title {
                    height: 100%;
                    display: flex;
                    align-items: center;
                }

                .el-collapse-item__arrow {
                    position: relative;
                    margin-left: 10px;
                }
            }

            .el-collapse-item__wrap {
                background-color: transparent !important;
                border-bottom: 1px solid #5c5c5c;

                .el-collapse-item__content {
                    padding-bottom: unset !important;
                }
            }
        }
    }
}
</style>
