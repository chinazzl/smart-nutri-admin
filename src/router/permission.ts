import router, { MENU_CONFIG } from './index';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const whiteList = ['/login'];

const isValidToken = (token: string): boolean => {
  if (!token) return false;
  if (token === 'null' || token === 'undefined' || token === '') return false;
  return true;
};

function getUserRole(): 'admin' | 'user' | null {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    const info = JSON.parse(raw);
    return info.role ?? null;
  } catch {
    return null;
  }
}

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - 智能营养管理系统`
    : '智能营养管理系统';

  const token = localStorage.getItem('userToken');

  if (isValidToken(token || '')) {
    if (to.path === '/login') {
      next({ path: '/' });
      return;
    }

    // 角色权限检查
    const role = getUserRole();
    const allowedRoles = (to.meta.roles as string[] | undefined) ?? ['all'];

    const hasAccess =
      allowedRoles.includes('all') ||
      (role && allowedRoles.includes(role));

    if (!hasAccess) {
      ElMessage.warning('无权限访问该资源，将跳转至仪表盘');
      next('/dashboard');
      return;
    }

    next();
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      ElMessage.warning('请先登录');
      next(`/login?redirect=${to.path}`);
    }
  }
});

router.afterEach((_to, _from) => {
  // 路由跳转后处理
});
