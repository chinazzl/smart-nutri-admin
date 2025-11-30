import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login as loginApi, logout as logoutApi, getUserInfo as getUserInfoApi, type LoginParams } from '@/api/auth';
import router from '@/router';
import { ElMessage } from 'element-plus';

export interface UserInfo {
  id: string;
  userName: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('userToken') || '');
  const userInfo = ref<UserInfo | null>(null);

  // 设置 Token
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('userToken', newToken);
  };

  // 设置用户信息
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info;
    localStorage.setItem('userInfo', JSON.stringify(info));
  };

  // 登录
  const login = async (loginParams: LoginParams) => {
    try {
      const res = await loginApi(loginParams);
      
      // 保存 token 和用户信息
      setToken(res.accessToken);
      setUserInfo(res.userData.userVo);
      
      ElMessage.success('登录成功');
      
      // 跳转到首页或重定向页面
      const redirect = router.currentRoute.value.query.redirect as string;
      router.push(redirect || '/dashboard');
      
      return res;
    } catch (error) {
      console.error('登录失败：', error);
      throw error;
    }
  };

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await getUserInfoApi();
      setUserInfo(res);
      return res;
    } catch (error) {
      console.error('获取用户信息失败：', error);
      throw error;
    }
  };

  // 退出登录
  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('退出登录失败：', error);
    } finally {
      // 清除本地数据
      token.value = '';
      userInfo.value = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      
      // 跳转到登录页
      router.push('/login');
      ElMessage.success('已退出登录');
    }
  };

  // 重置用户信息
  const resetUserInfo = () => {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
  };

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    login,
    getUserInfo,
    logout,
    resetUserInfo
  };
});