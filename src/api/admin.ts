/**
 * 管理后台 API（真实后端接口）
 *
 * TODO 后端实现以下接口后，将 src/views/dashboard/index.vue 和 src/views/admin/user-management.vue 中的 mock 数据替换为真实 API 调用。
 *
 * 接口统一响应格式：{ code: 200, data: ... }
 * 所有接口需要在请求头中携带 Authorization: Bearer <token>
 * 仅管理员角色可访问
 */

import request from './request';

// ========== 用户管理 ==========

/**
 * 获取全部用户列表（管理员）
 * GET /v1/admin/users
 * 查询参数：page?, pageSize?, keyword?（可选）
 * 响应：{ list: SystemUser[], total: number }
 */
export const getAdminUsers = (params?: { page?: number; pageSize?: number; keyword?: string }) => {
  return request<{ list: any[]; total: number }>({
    url: '/v1/admin/users',
    method: 'get',
    params,
  });
};

/**
 * 获取单个用户详情（含身体档案）
 * GET /v1/admin/users/:id
 * 响应：SystemUser
 */
export const getAdminUserById = (userId: string) => {
  return request<any>({
    url: `/v1/admin/users/${userId}`,
    method: 'get',
  });
};

/**
 * 修改用户状态（启用/禁用）
 * PATCH /v1/admin/users/:id/status
 * 请求体：{ status: 'active' | 'disabled' }
 * 响应：{ code: 200 }
 */
export const updateUserStatus = (userId: string, data: { status: 'active' | 'disabled' }) => {
  return request({
    url: `/v1/admin/users/${userId}/status`,
    method: 'patch',
    data,
  });
};

/**
 * 修改用户角色
 * PATCH /v1/admin/users/:id/role
 * 请求体：{ role: 'admin' | 'user' }
 * 响应：{ code: 200 }
 */
export const updateUserRole = (userId: string, data: { role: 'admin' | 'user' }) => {
  return request({
    url: `/v1/admin/users/${userId}/role`,
    method: 'patch',
    data,
  });
};

/**
 * 获取指定用户本周营养统计数据
 * GET /v1/admin/users/:id/weekly-stats
 * 响应：{ weeklyNutrition: number, weeklyBurned: number }
 */
export const getUserWeeklyStats = (userId: string) => {
  return request<{ weeklyNutrition: number; weeklyBurned: number }>({
    url: `/v1/admin/users/${userId}/weekly-stats`,
    method: 'get',
  });
};

// ========== 仪表盘统计数据 ==========

/**
 * 获取平台概览统计数据
 * GET /v1/admin/stats
 * 响应：{ dau, aiCalls, stretchRate, totalUsers }
 */
export const getAdminStats = () => {
  return request<{ dau: number; aiCalls: number; stretchRate: number; totalUsers: number }>({
    url: '/v1/admin/stats',
    method: 'get',
  });
};

/**
 * 获取近 N 天用户注册趋势
 * GET /v1/admin/user-registrations
 * 查询参数：days（默认7）
 * 响应：Array<{ date: string, count: number }>
 */
export const getUserRegistrationTrend = (days = 7) => {
  return request<Array<{ date: string; count: number }>>({
    url: '/v1/admin/user-registrations',
    method: 'get',
    params: { days },
  });
};

/**
 * 获取功能使用分布
 * GET /v1/admin/feature-usage
 * 响应：Array<{ name: string, value: number }>
 */
export const getFeatureUsage = () => {
  return request<Array<{ name: string; value: number }>>({
    url: '/v1/admin/feature-usage',
    method: 'get',
  });
};

/**
 * 获取今日活跃用户列表
 * GET /v1/admin/active-users
 * 查询参数：limit（默认10）
 * 响应：Array<{ userId, username, action, time, calories }>
 */
export const getActiveUsers = (limit = 10) => {
  return request<Array<{ username: string; action: string; time: string; calories: number }>>({
    url: '/v1/admin/active-users',
    method: 'get',
    params: { limit },
  });
};

/**
 * 获取服务器状态
 * GET /v1/admin/server-status
 * 响应：Array<{ name, status, latency }>
 */
export const getServerStatus = () => {
  return request<Array<{ name: string; status: string; latency: string }>>({
    url: '/v1/admin/server-status',
    method: 'get',
  });
};
