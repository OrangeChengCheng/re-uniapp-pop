/*
 * @Author: Lemon C
 * @Date: 2025-07-02 11:25:16
 * @LastEditTime: 2025-07-04 10:14:21
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // 单独导入类型
import TreePage from '@/views/Tree/TreePage.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/tree',
        name: 'tree',
        component: TreePage
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
