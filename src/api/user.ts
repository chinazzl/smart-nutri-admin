
import request from './request';

export interface UserProfile {
  gender: "male" | "female";
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: number; // 1.2 ~ 1.9 系数
  goal: "lose" | "maintain" | "gain"; // 减脂/维持/增肌
}

/**
 * 获取用户身体档案
 * TODO 后端接口：GET /v1/users/profile
 * 响应：{ code: 200, data: UserProfile }
 */
export const getProfile = () => {
  return request<UserProfile>({
    url: '/v1/users/profile',
    method: 'get'
  });
};

/**
 * 更新用户身体档案
 * TODO 后端接口：PUT /v1/users/profile
 * 请求体：UserProfile
 * 响应：{ code: 200, data: UserProfile }
 */
export const updateProfile = (data: UserProfile) => {
  return request({
    url: '/v1/users/profile',
    method: 'put',
    data
  });
};
