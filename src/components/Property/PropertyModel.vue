<!--
 * @Author: Lemon C
 * @Date: 2025-07-11 15:48:00
 * @LastEditTime: 2025-07-17 17:02:00
-->
<template>
    <div class="property-model-area">
        <div class="tab-area">
            <div :class="`item-box ${curTab === 'basic' ? 'active' : ''}`" @click="tab_click('basic')">基础属性</div>
            <div :class="`item-box ${curTab === 'extend' ? 'active' : ''}`" @click="tab_click('extend')">扩展属性</div>
        </div>
        <attr-scroll-table v-if="computed_curShowList.length > 0" :attr_list="computed_curShowList"></attr-scroll-table>
        <empty-comp v-else :empty_title="'当前构件暂无扩展属性'"></empty-comp>
    </div>
</template>

// MOD-- JavaScript
<script setup lang="ts">
import { ref, PropType, computed } from 'vue';
import AttrScrollTable from './AttrScrollTable.vue';
import EmptyComp from '@/components/Empty/EmptyComp.vue';

const props = defineProps({
    basic_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    extend_list: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
});

const curTab = ref('basic');

const computed_curShowList = computed(() => {
    if (curTab.value == 'basic') {
        return props.basic_list;
    } else {
        return props.extend_list;
    }
});

const tab_click = (e: string) => {
    curTab.value = e;
};
</script>

// MOD-- CSS
<style lang="scss" scoped>
.property-model-area {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    .tab-area {
        position: relative;
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        padding: 2px;
        background: #1a1a1a;
        color: white;
        border-radius: 4px;
        font-size: 14px;
        margin-bottom: 8px;

        .item-box {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 2px;
            flex: 1;
            padding: 5px;
            cursor: pointer;
            border-radius: 3px;

            &.active {
                color: white;
                background: #252525;
            }
        }
    }
}
</style>
