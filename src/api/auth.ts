import request from './request';

// 用户登录参数
export interface LoginParams {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// 用户注册参数
export interface RegisterParams {
  username: string;
  phone: string;
  code: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  userVo: {
    id: string;
    userName: string;
    avatar?: string;
    email?: string;
    phone?: string;
  };
}

/**
 * 用户登录
 */
export const login = (data: LoginParams) => {
  return request<LoginResponse>({
    url: '/v1/users/login',
    method: 'post',
    data
  });
};

/**
 * 用户注册
 */
export const register = (data: RegisterParams) => {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  });
};

/**
 * 发送验证码
 */
export const sendVerifyCode = (phone: string) => {
  return request({
    url: '/api/auth/send-code',
    method: 'post',
    data: { phone }
  });
};

/**
 * 退出登录
 */
export const logout = () => {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  });
};

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return request({
    url: '/api/auth/user-info',
    method: 'get'
  });
};

/**
 * 修改密码
 */
export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  return request({
    url: '/api/auth/change-password',
    method: 'post',
    data
  });
};

/**
 * 重置密码（忘记密码）
 */
export const resetPassword = (data: {
  phone: string;
  code: string;
  newPassword: string;
}) => {
  return request({
    url: '/api/auth/reset-password',
    method: 'post',
    data
  });
};