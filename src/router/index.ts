/*
 * @Author: Lemon C
 * @Date: 2025-07-02 11:25:16
 * @LastEditTime: 2025-07-03 12:05:24
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
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
