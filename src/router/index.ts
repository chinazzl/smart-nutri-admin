import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import Layout from "@/layout/index.vue";

const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
];

export type RouteRole = 'admin' | 'user' | 'all';

export interface MenuItem {
  path: string;
  name: string;
  title: string;
  icon: string;
  roles: RouteRole[];
}

export const MENU_CONFIG: MenuItem[] = [
  { path: '/dashboard', name: 'Dashboard', title: '仪表盘', icon: 'DataBoard', roles: ['all'] },
  { path: '/nutrition', name: 'Nutrition', title: '饮食日记', icon: 'Dish', roles: ['user'] },
  { path: '/activity', name: 'Activity', title: '运动追踪', icon: 'Bicycle', roles: ['user'] },
  { path: '/ai-assistant', name: 'AiAssistant', title: 'AI健康助手', icon: 'ChatDotRound', roles: ['user'] },
  { path: '/profile', name: 'Profile', title: '健康档案', icon: 'User', roles: ['all'] },
  { path: '/user-management', name: 'UserManagement', title: '用户管理', icon: 'Grid', roles: ['admin'] },
];

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
        meta: { title: "仪表盘", icon: "DataBoard", roles: ['all'] },
      },
      {
        path: "nutrition",
        name: "Nutrition",
        component: () => import("@/views/nutrition/index.vue"),
        meta: { title: "饮食日记", icon: "Dish", roles: ['user'] },
      },
      {
        path: "activity",
        name: "Activity",
        component: () => import("@/views/activity/index.vue"),
        meta: { title: "运动追踪", icon: "Bicycle", roles: ['user'] },
      },
      {
        path: "ai-assistant",
        name: "AiAssistant",
        component: () => import("@/views/ai-assistant/index.vue"),
        meta: { title: "AI健康助手", icon: "ChatDotRound", roles: ['user'] },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "健康档案", icon: "User", roles: ['all'] },
      },
      {
        path: "user-management",
        name: "UserManagement",
        component: () => import("@/views/admin/user-management.vue"),
        meta: { title: "用户管理", icon: "Grid", roles: ['admin'] },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes.concat(asyncRoutes),
});

export default router;
