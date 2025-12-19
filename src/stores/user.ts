import { defineStore } from "pinia";
import { ref } from "vue";
import {
  login as loginApi,
  logout as logoutApi,
  getUserInfo as getUserInfoApi,
  type LoginParams,
} from "@/api/auth";
import { updateProfile, getProfile, type UserProfile } from "@/api/user";
import router from "@/router";
import { ElMessage } from "element-plus";
import { computed, reactive } from "vue";

export interface UserInfo {
  id: string;
  userName: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: string;
}
// 定义类型接口

const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  if (token === "null" || token === "undefined" || token === "") return false;
  return true;
};

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

  // 登录
  const login = async (loginParams: LoginParams) => {
    try {
      const res = await loginApi(loginParams);

      // 保存 token 和用户信息
      setToken(res.accessToken, res.refreshToken);
      setUserInfo(res.userData.userVo);

      ElMessage.success("登录成功");

      // 跳转到首页或重定向页面
      const redirect = router.currentRoute.value.query.redirect as string;

      if (redirect && redirect !== "/login") {
        router.push(redirect);
      }else {
        router.push("/dashboard");
      }
      return res;
    } catch (error) {
      console.error("登录失败：", error);
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
      console.error("获取用户信息失败：", error);
      throw error;
    }
  };

  // 退出登录
  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("退出登录失败：", error);
    } finally {
      // 清除本地数据
      token.value = "";
      refreshToken.value = "";
      userInfo.value = null;
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");

      // 跳转到登录页
      router.push("/login");
      ElMessage.success("已退出登录");
    }
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
      resetUserInfo
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
