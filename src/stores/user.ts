import { defineStore } from "pinia";
import { ref } from "vue";
import {
  login as loginApi,
  logout as logoutApi,
  getUserInfo as getUserInfoApi,
  register as registerApi,
  type LoginParams,
  type RegisterParams,
  type LoginResponse,
} from "@/api/auth";
import { updateProfile, getProfile, type UserProfile } from "@/api/user";
import router from "@/router";
import { ElMessage } from "element-plus";
import { computed, reactive } from "vue";

export interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'user';
}

const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  if (token === "null" || token === "undefined" || token === "") return false;
  return true;
};

// Mock 演示账号（后端实现后删除）
// TODO: 后端登录接口上线后，删除以下 MOCK_ACCOUNTS 及 src/stores/user.ts 中的 Mock 账号拦截逻辑
const MOCK_ACCOUNTS: Record<string, { password: string; user: UserInfo }> = {
  admin: {
    password: 'admin123',
    user: { id: 'mock-admin-001', username: '管理员', role: 'admin', avatar: '' },
  },
  user: {
    password: 'user123',
    user: { id: 'mock-user-001', username: '张三', role: 'user', avatar: '' },
  },
};

// 系统用户列表（用于用户管理）
// TODO 后端接口：GET /v1/admin/users，后端返回用户列表后替换为真实 API 调用
export interface SystemUser extends UserInfo {
  status: 'active' | 'disabled';
  createdAt: string;
  profile?: {
    gender: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: number;
    goal: string;
  };
}

const SYSTEM_USERS_KEY = 'smart_nutri_system_users';
const DEFAULT_SYSTEM_USERS: SystemUser[] = [
  { id: 'mock-admin-001', username: '管理员', role: 'admin', status: 'active', createdAt: '2024-01-01T08:00:00Z' },
  { id: 'mock-user-001', username: '张三', role: 'user', status: 'active', createdAt: '2024-01-15T09:30:00Z', profile: { gender: 'male', age: 28, height: 175, weight: 72, activityLevel: 1.375, goal: 'maintain' } },
  { id: 'mock-user-002', username: '李四', role: 'user', status: 'active', createdAt: '2024-02-01T10:00:00Z', profile: { gender: 'female', age: 24, height: 162, weight: 55, activityLevel: 1.2, goal: 'lose' } },
  { id: 'mock-user-003', username: '王五', role: 'user', status: 'active', createdAt: '2024-03-10T14:20:00Z', profile: { gender: 'male', age: 35, height: 180, weight: 85, activityLevel: 1.55, goal: 'lose' } },
  { id: 'mock-user-004', username: '赵六', role: 'user', status: 'disabled', createdAt: '2024-04-05T11:15:00Z', profile: { gender: 'female', age: 30, height: 165, weight: 60, activityLevel: 1.375, goal: 'maintain' } },
];

// TODO 后端接口：GET /v1/admin/users，返回后用真实 API 替换 localStorage 逻辑
export function getSystemUsers(): SystemUser[] {
  try {
    const raw = localStorage.getItem(SYSTEM_USERS_KEY);
    if (!raw) {
      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(DEFAULT_SYSTEM_USERS));
      return DEFAULT_SYSTEM_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SYSTEM_USERS;
  }
}

// TODO 后端接口：PATCH /v1/admin/users/:id/status 和 PATCH /v1/admin/users/:id/role，
// 后端实现后替换为真实 API 调用（见 src/api/admin.ts）
export function saveSystemUsers(users: SystemUser[]) {
  localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(users));
}

export const useUserStore = defineStore("user", () => {
  // 状态
  const token = ref<string>(localStorage.getItem("userToken") || "");
  const refreshToken = ref<string>(localStorage.getItem("refreshToken") || "");
  const userInfo = ref<UserInfo | null>(localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo") as string) : null);

  // 设置 Token
  const setToken = (newToken: string, refreshT: string) => {
    token.value = newToken;
    refreshToken.value = refreshT;
    localStorage.setItem("userToken", newToken);
    localStorage.setItem("refreshToken", refreshT);
  };

  // 设置用户信息
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info;
    localStorage.setItem("userInfo", JSON.stringify(info));
  };

  // 登录（支持 Mock 账号与真实 API）
  // TODO: 后端登录接口上线后，删除以下 Mock 账号拦截逻辑（111-134行），只保留真实 API 调用
  const login = async (loginParams: LoginParams) => {
    // Mock 账号拦截：本地验证并注入 role
    if (loginParams.username && loginParams.password) {
      const mock = MOCK_ACCOUNTS[loginParams.username];
      if (mock && mock.password === loginParams.password) {
        const systemUsers = getSystemUsers();
        const systemUser = systemUsers.find((u) => u.id === mock.user.id);
        if (systemUser && systemUser.status === 'disabled') {
          ElMessage.error('该账号已被禁用，请联系管理员');
          throw new Error('账号已被禁用');
        }
        const mockToken = `mock_token_${Date.now()}`;
        setToken(mockToken, mockToken);
        setUserInfo(mock.user);
        ElMessage.success('登录成功（演示账号）');
        const redirect = router.currentRoute.value.query.redirect as string;
        if (redirect && redirect !== '/login') {
          router.push(redirect);
        } else {
          router.push('/dashboard');
        }
        return { accessToken: mockToken, user: mock.user };
      }
    }

    try {
      const res = await loginApi(loginParams) as unknown as LoginResponse;

      // 兼容两种后端返回格式
      const accessTok = res.accessToken ?? res.token ?? '';
      const refreshTok = res.refreshToken ?? '';
      const userObj = res.user ?? (res.userVo ? {
        id: res.userVo.id,
        username: res.userVo.userName,
        avatar: res.userVo.avatar,
        email: res.userVo.email,
        phone: res.userVo.phone,
      } : null);

      // 保存 token 和用户信息
      setToken(accessTok, refreshTok);
      if (userObj) setUserInfo(userObj as UserInfo);

      ElMessage.success("登录成功");

      // 跳转到首页或重定向页面
      const redirect = router.currentRoute.value.query.redirect as string;

      if (redirect && redirect !== "/login") {
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
      return res;
    } catch (error) {
      throw error;
    }
  };

  // 注册
  const register = async (registerParams: RegisterParams) => {
    try {
      const res = await registerApi(registerParams);
      ElMessage.success("注册成功，请登录");
      return res;
    } catch (error) {
      console.error("注册失败：", error);
      throw error;
    }
  };

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await getUserInfoApi();
      setUserInfo(res as unknown as UserInfo);
      return res;
    } catch (error) {
      console.error("获取用户信息失败：", error);
      throw error;
    }
  };

  // 退出登录
  const logout = async () => {
    const isMock = token.value.startsWith('mock_token_');
    if (!isMock) {
      try {
        await logoutApi();
      } catch {}
    }
    // 清除本地数据
    token.value = "";
    refreshToken.value = "";
    userInfo.value = null;
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    router.push("/login");
    ElMessage.success("已退出登录");
  };

  // 重置用户信息
  const resetUserInfo = () => {
    token.value = "";
    userInfo.value = null;
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
  };

  // 1. 状态 State (默认值)
  const profile = reactive<UserProfile>({
    gender: "male",
    age: 25,
    height: 175,
    weight: 70,
    activityLevel: 1.375, // 默认为轻度活动
    goal: "maintain",
  });

  // 标记档案是否已从后端加载
  const profileLoaded = ref(false);

  // 2. 计算属性 Getters (自动计算核心指标)

  // BMI 计算
  const bmi = computed(() => {
    const h = profile.height / 100;
    return Number((profile.weight / (h * h)).toFixed(1));
  });

  // BMR 基础代谢 (Mifflin-St Jeor 公式)
  const bmr = computed(() => {
    let base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    return profile.gender === "male"
      ? Math.round(base + 5)
      : Math.round(base - 161);
  });

  // TDEE 每日总消耗 (BMR * 活动系数)
  const tdee = computed(() => {
    return Math.round(bmr.value * profile.activityLevel);
  });

  // 每日建议摄入热量 (根据目标调整)
  const targetCalories = computed(() => {
    switch (profile.goal) {
      case "lose":
        return tdee.value - 500; // 制造 500 热量缺口
      case "gain":
        return tdee.value + 300; // 制造 300 热量盈余
      default:
        return tdee.value;
    }
  });

  // 宏观营养素建议 (简单算法：碳水50% 蛋白30% 脂肪20%)
  const macros = computed(() => {
    const total = targetCalories.value;
    return {
      carbs: Math.round((total * 0.5) / 4), // 1g碳水=4kcal
      protein: Math.round((total * 0.3) / 4), // 1g蛋白=4kcal
      fat: Math.round((total * 0.2) / 9), // 1g脂肪=9kcal
    };
  });

  // 3. 动作 Actions
  
  /**
   * 从后端加载用户档案
   */
  async function loadProfile() {
    try {
      const res = await getProfile();
      // 更新 profile 数据
      Object.assign(profile, res);
      profileLoaded.value = true;
      return res;
    } catch (error) {
      console.error("加载档案失败:", error);
      // 如果加载失败，使用默认值，不抛出错误
      profileLoaded.value = true;
    }
  }

  async function saveProfile(newProfile: UserProfile) {
    try {
      const res = await updateProfile(newProfile);
      Object.assign(profile, newProfile);
      // 如果后端返回了新的 profile，也可以在这里合并
       ElMessage.success({
        message: "健康档案已更新！AI 营养师已根据新数据调整方案。",
        type: "success",
        duration: 3000,
      });
      return res;
    } catch (error) {
       console.error("保存档案失败:", error);
       throw error;
    }
  }

  const checkLoginState = (): boolean => {
    const currentToken = localStorage.getItem("userToken");
    if (!isValidToken(currentToken)) {
      resetUserInfo();
      return false;
    }
    return true;
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    login,
    register,
    getUserInfo,
    logout,
    resetUserInfo,
    profile,
    profileLoaded,
    bmi,
    bmr,
    tdee,
    targetCalories,
    macros,
    loadProfile,
    saveProfile,
    checkLoginState
  };
});
