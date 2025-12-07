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
    console.log("请求配置：", config)
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
let isRefreshing = false;
let failedQueue: any[] = [];
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
    console.log("响应数据：", res)
    return res.data;
  },
  async (error) => {
    // console.error('响应错误：', error);
    
    // // 处理网络错误
    // if (error.message.includes('timeout')) {
    //   ElMessage.error('请求超时，请稍后重试');
    // } else if (error.message.includes('Network Error')) {
    //   ElMessage.error('网络连接失败，请检查网络');
    // } else {
    //   ElMessage.error(error.response?.data?.message || '服务器错误');
    // }
    
    // return Promise.reject(error);
    const originalRequest = error.config
    
    // Token 过期，尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          return service(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // 调用刷新 token 接口
        const response = await axios.post('/api/auth/refresh', {
          refreshToken
        })

        const { token, refreshToken: newRefreshToken } = response.data.data
        
        // 更新 token
        localStorage.setItem('userToken', token)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        // 重试原请求
        originalRequest.headers['Authorization'] = `Bearer ${token}`
        
        // 处理队列中的请求
        failedQueue.forEach(({ resolve }) => {
          resolve(service(originalRequest))
        })
        failedQueue = []
        
        return service(originalRequest)
      } catch (refreshError) {
        // 刷新失败，清除 token 并跳转登录
        localStorage.removeItem('userToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
);

// 封装 GET 请求
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return service.get(url, config);
};

// 封装 POST 请求
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  console.log("POST 请求 URL:", url, "数据:", data, "配置:", config);
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