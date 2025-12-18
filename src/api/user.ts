
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
 * 更新用户身体档案
 */
export const updateProfile = (data: UserProfile) => {
  return request({
    url: '/v1/users/profile',
    method: 'post',
    data
  });
};
