import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const router = useRouter();

  // 模拟登录动作
  const login = async (loginForm: any) => {
    // 实际项目中这里调用 API
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (loginForm.username === 'admin' || loginForm.phone) {
          token.value = 'mock-jwt-token-123456';
          localStorage.setItem('token', token.value);
          ElMessage.success(`欢迎回来，${loginForm.username || '用户'}!`);
          resolve();
        } else {
          ElMessage.error('模拟登录失败，请重试');
        }
      }, 1000);
    });
  };

  // 退出登录
  const logout = () => {
    token.value = null;
    localStorage.removeItem('token');
    // 注意：这里可能需要从组件中调用 router，或者在 main.ts 中处理
    window.location.href = '/#/login'; 
  };

  return { token, login, logout };
});