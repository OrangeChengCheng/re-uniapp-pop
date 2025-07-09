/*
 * @Author: Lemon C
 * @Date: 2025-07-02 11:25:16
 * @LastEditTime: 2025-07-07 15:05:30
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router' // 单独导入类型
import TreePage from '@/views/Tree/TreePage.vue'
import PropertyPage from '@/views/Property/PropertyPage.vue'
import CADPage from '@/views/CAD/CADPage.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/tree',
        name: 'tree',
        component: TreePage
    },
    {
        path: '/property',
        name: 'property',
        component: PropertyPage
    },
    {
        path: '/cad',
        name: 'cad',
        component: CADPage
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
