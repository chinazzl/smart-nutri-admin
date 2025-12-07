import router from './index';
import { ElMessage } from 'element-plus';
console.log('router permission loaded');
// 白名单：不需要登录就可以访问的页面
const whiteList = ['/login'];

// 验证token是否有效的辅助函数
const isValidToken = (token: string): boolean => {
  if (!token) return false;
  if(token ==='null' || token ==='undefined' || token ==='') return false;
  // 这里可以添加更多的验证逻辑，例如解码 JWT 并检查过期时间
  return true;
}

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('路由守卫：', to.path);
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 智能营养管理系统` : '智能营养管理系统';
  
  // 获取 token
  const token = localStorage.getItem('userToken');
  
  if (isValidToken(token || '')) {
    // 已登录
    if (to.path === '/login') {
      // 如果已登录，访问登录页则跳转到首页
      next({ path: '/' });
    } else {
      // 正常访问其他页面
      next();
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 在白名单中，直接访问
      next();
    } else {
      // 不在白名单中，跳转到登录页
      ElMessage.warning('请先登录');
      next(`/login?redirect=${to.path}`);
    }
  }
});

// 全局后置守卫
router.afterEach((to, from) => {
  // 可以在这里做一些页面跳转后的处理
  // 例如：埋点统计、页面访问记录等
  console.log('路由跳转：', from.path, '->', to.path);
});