import { createRouter,createWebHashHistory,type RouteRecordRaw, type RouteRecord } from "vue-router";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/login',
        name: 'Login',
        // 懒加载：访问的时候才加载文件，提升性能
        component: () => import('@/views/login/index.vue')
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router;
    