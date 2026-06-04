/**
 * 运动记录 API（真实后端接口）
 *
 * TODO 后端实现以下接口后，删除 src/api/activity.ts 中的 localStorage 实现，
 * 并将 src/stores/activity.ts 改用本文件的真实 API 函数。
 *
 * 接口统一响应格式：{ code: 200, data: ... }
 * 所有接口需要在请求头中携带 Authorization: Bearer <token>
 */

import type { ActivityLog, StretchSession } from '@/types/activity';
import request from './request';

/**
 * 获取某日运动记录
 * GET /v1/activity?date=YYYY-MM-DD
 * 响应：DayActivitySummary
 */
export const getActivityByDate = (date: string) => {
  return request<any>({
    url: '/v1/activity',
    method: 'get',
    params: { date },
  });
};

/**
 * 添加运动记录
 * POST /v1/activity/exercises
 * 请求体：{ date, exerciseId, duration, weight }
 * 响应：ActivityLog
 */
export const addExercise = (data: {
  date: string;
  exerciseId: string;
  duration: number;
  weight: number;
}) => {
  return request<ActivityLog>({
    url: '/v1/activity/exercises',
    method: 'post',
    data,
  });
};

/**
 * 删除运动记录
 * DELETE /v1/activity/exercises/:logId?date=YYYY-MM-DD
 * 响应：{ code: 200 }
 */
export const deleteExercise = (logId: string, date: string) => {
  return request({
    url: `/v1/activity/exercises/${logId}`,
    method: 'delete',
    params: { date },
  });
};

/**
 * 添加拉伸打卡记录
 * POST /v1/activity/stretches
 * 请求体：{ date, stretchId, name, duration, calories }
 * 响应：StretchSession
 */
export const addStretch = (data: {
  date: string;
  stretchId: string;
  name: string;
  duration: number;
  calories: number;
}) => {
  return request<StretchSession>({
    url: '/v1/activity/stretches',
    method: 'post',
    data,
  });
};

/**
 * 获取运动库列表（可选，后端可维护运动数据库）
 * GET /v1/activity/exercises
 * 响应：Exercise[]
 * TODO: 如果后端维护独立的运动库，实现此接口；否则沿用 src/types/activity.ts 中的 BUILTIN_EXERCISES
 */
export const getExerciseList = () => {
  return request<any[]>({
    url: '/v1/activity/exercises',
    method: 'get',
  });
};
