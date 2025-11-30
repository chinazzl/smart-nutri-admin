import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '@/router';

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // API 基础路径
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('userToken');
    
    if (token) {
      // 在请求头中添加 token
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('请求错误：', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    
    // 如果返回的状态码不是 200，则认为是错误
    if (res.code !== 200 && res.code !== 0) {
      ElMessage.error(res.message || '请求失败');
      
      // 401: 未授权，token过期
      if (res.code === 401) {
        ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 清除 token
          localStorage.removeItem('userToken');
          localStorage.removeItem('userInfo');
          
          // 跳转到登录页
          router.push('/login');
        });
      }
      
      // 403: 无权限
      if (res.code === 403) {
        ElMessage.error('无权限访问该资源');
      }
      
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    // 返回数据
    return res.data;
  },
  (error) => {
    console.error('响应错误：', error);
    
    // 处理网络错误
    if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试');
    } else if (error.message.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络');
    } else {
      ElMessage.error(error.response?.data?.message || '服务器错误');
    }
    
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return service.get(url, config);
};

// 封装 POST 请求
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return service.post(url, data, config);
};

// 封装 PUT 请求
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return service.put(url, data, config);
};

// 封装 DELETE 请求
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return service.delete(url, config);
};

// 通用请求方法
export default service;