import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";

import Layout from "@/layout/index.vue";

// 不需要Layout框架的页面，如登录、404等
const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    // 懒加载：访问的时候才加载文件，提升性能
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
    },
  },
];

// 业务路由
export const asyncRoutes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "仪表盘", icon: "DataBoard" }, // meta 信息用于面包屑和侧边栏
      },
      {
        path: "diet-record",
        name: "DietRecord",
        component: () => import("@/views/dashboard/index.vue"), // 暂时指向仪表盘页面
        meta: { title: "饮食记录", icon: "Dish" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  //合并路由
  routes: constantRoutes.concat(asyncRoutes),
});

export default router;
