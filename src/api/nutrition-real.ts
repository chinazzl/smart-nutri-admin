/**
 * 饮食记录 API（真实后端接口）
 *
 * TODO 后端实现以下接口后，删除 src/api/nutrition.ts 中的 localStorage 实现，
 * 并将 src/stores/nutrition.ts 改用本文件的真实 API 函数。
 *
 * 接口统一响应格式：{ code: 200, data: ... }
 * 所有接口需要在请求头中携带 Authorization: Bearer <token>
 */

import type { Food, DietLog, MealType } from '@/types/nutrition';
import request from './request';

/**
 * 获取某日饮食记录
 * GET /v1/diet/logs?date=YYYY-MM-DD
 * 响应：DietLog[]
 */
export const getDietLogs = (date: string) => {
  return request<DietLog[]>({
    url: '/v1/diet/logs',
    method: 'get',
    params: { date },
  });
};

/**
 * 添加饮食记录
 * POST /v1/diet/logs
 * 请求体：{ date, mealType, foodId, weight }
 * 响应：DietLog
 */
export const addDietLog = (data: {
  date: string;
  mealType: MealType;
  foodId: string;
  weight: number;
}) => {
  return request<DietLog>({
    url: '/v1/diet/logs',
    method: 'post',
    data,
  });
};

/**
 * 更新饮食记录（修改克数）
 * PUT /v1/diet/logs/:logId
 * 请求体：{ weight }
 * 响应：DietLog
 */
export const updateDietLog = (logId: string, data: { weight: number }) => {
  return request<DietLog>({
    url: `/v1/diet/logs/${logId}`,
    method: 'put',
    data,
  });
};

/**
 * 删除饮食记录
 * DELETE /v1/diet/logs/:logId?date=YYYY-MM-DD
 * 响应：{ code: 200 }
 */
export const deleteDietLog = (logId: string, date: string) => {
  return request({
    url: `/v1/diet/logs/${logId}`,
    method: 'delete',
    params: { date },
  });
};

/**
 * 获取某月饮食汇总数据（日历热量展示用）
 * GET /v1/diet/monthly?year=2024&month=6
 * 响应：DayNutritionSummary[]
 */
export const getMonthlyDietData = (year: number, month: number) => {
  return request<any[]>({
    url: '/v1/diet/monthly',
    method: 'get',
    params: { year, month },
  });
};

/**
 * 搜索食物（模糊匹配）
 * GET /v1/foods/search?keyword=xxx
 * 响应：Food[]
 * TODO: 如果后端有食物数据库，实现此接口；否则沿用 src/data/foods.json 本地数据
 */
export const searchFoodsApi = (keyword: string) => {
  return request<Food[]>({
    url: '/v1/foods/search',
    method: 'get',
    params: { keyword },
  });
};

/**
 * 获取全部食物列表
 * GET /v1/foods
 * 响应：Food[]
 * TODO: 如果后端有食物数据库，实现此接口；否则沿用 src/data/foods.json 本地数据
 */
export const getAllFoods = () => {
  return request<Food[]>({
    url: '/v1/foods',
    method: 'get',
  });
};

/**
 * AI 自然语言解析饮食记录
 * POST /v1/diet/parse
 * 请求体：{ text }
 * 响应：{ items: Array<{ foodId, weight, mealType }> }
 * TODO: 如果需要后端提供 NLP 解析能力，实现此接口
 */
export const parseDietText = (text: string) => {
  return request<{ items: Array<{ foodId: string; weight: number; mealType: MealType }> }>({
    url: '/v1/diet/parse',
    method: 'post',
    data: { text },
  });
};
