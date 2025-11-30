<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 左侧：品牌展示区 -->
      <div class="login-left">
        <div class="brand-content">
          <div class="logo">
            <img src="@/assets/logo.svg" alt="Smart Nutri" />
            <span>Smart Nutri</span>
          </div>
          <h2 class="slogan">AI 驱动的<br />智能营养管理专家</h2>
          <p class="desc">
            结合前沿人工智能技术，为您提供精准的膳食分析与健康管理方案。
            让数据守护您的每一餐。
          </p>
          <div class="illustration">
            <!-- 这里使用 CSS 绘制一个简单的抽象图形，实际项目可用 svg 插画 -->
            <div class="circle c1"></div>
            <div class="circle c2"></div>
            <div class="glass-card">
              <el-icon :size="30"><TrendCharts /></el-icon>
              <span>健康指数 +15%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：表单操作区 -->
      <div class="login-right">
        <div class="form-wrapper">
          <h2 class="welcome-text">
            {{ isRegister ? '创建账号' : '欢迎登录' }}
          </h2>
          <p class="sub-text">
            {{ isRegister ? '开启您的健康之旅' : '请输入您的账号信息以继续' }}
          </p>

          <!-- 登录/注册 表单切换 -->
          <el-tabs v-model="activeTab" class="custom-tabs" @tab-click="handleTabClick">
            <el-tab-pane label="账号登录" name="account" v-if="!isRegister">
              <el-form ref="loginFormRef" :model="loginForm" :rules="rules" size="large">
                <el-form-item prop="username">
                  <el-input 
                    v-model="loginForm.username" 
                    placeholder="用户名 / 邮箱" 
                    :prefix-icon="User"
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input 
                    v-model="loginForm.password" 
                    type="password" 
                    placeholder="密码" 
                    show-password 
                    :prefix-icon="Lock"
                    @keyup.enter="handleLogin"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="手机登录" name="phone" v-if="!isRegister">
               <el-form :model="loginForm" size="large">
                <el-form-item>
                  <el-input v-model="loginForm.phone" placeholder="手机号码" :prefix-icon="Iphone" />
                </el-form-item>
                <el-form-item class="code-item">
                  <el-input v-model="loginForm.code" placeholder="验证码" :prefix-icon="Message" />
                  <el-button class="send-btn" type="primary" link>获取验证码</el-button>
                </el-form-item>
               </el-form>
            </el-tab-pane>
            
            <!-- 注册表单 (简化) -->
            <el-tab-pane label="快速注册" name="register" v-if="isRegister">
               <el-form :model="registerForm" size="large">
                 <el-form-item>
                  <el-input v-model="registerForm.username" placeholder="设置用户名" :prefix-icon="User" />
                </el-form-item>
                <el-form-item>
                  <el-input v-model="registerForm.phone" placeholder="手机号码" :prefix-icon="Iphone" />
                </el-form-item>
                 <el-form-item>
                  <el-input v-model="registerForm.password" type="password" placeholder="设置密码" :prefix-icon="Lock" />
                </el-form-item>
               </el-form>
            </el-tab-pane>
          </el-tabs>

          <!-- 辅助功能区 -->
          <div class="actions" v-if="!isRegister">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码?</el-link>
          </div>

          <!-- 按钮区 -->
          <el-button 
            type="primary" 
            class="submit-btn" 
            :loading="loading" 
            size="large" 
            @click="isRegister ? handleRegister() : handleLogin()"
          >
            {{ isRegister ? '立即注册' : '登 录' }}
          </el-button>

          <!-- 底部切换 -->
          <div class="footer-links">
            <span v-if="!isRegister">
              还没有账号? <span class="link-text" @click="toggleMode">立即注册</span>
            </span>
            <span v-else>
              已有账号? <span class="link-text" @click="toggleMode">去登录</span>
            </span>
          </div>
          
          <!-- 第三方登录 -->
          <div class="divider" v-if="!isRegister">
            <span>其他方式登录</span>
          </div>
          <div class="social-login" v-if="!isRegister">
            <div class="social-icon wechat"><el-icon><ChatDotRound /></el-icon></div>
            <div class="social-icon apple"><el-icon><IpbgOne /></el-icon></div> <!-- 需确保图标存在，这里暂用已有图标 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { User, Lock, Iphone, Message, TrendCharts, ChatDotRound } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

// 状态控制
const isRegister = ref(false);
const activeTab = ref('account');
const loading = ref(false);
const rememberMe = ref(true);

// 表单数据
const loginForm = reactive({
  username: 'admin',
  password: '123',
  phone: '',
  code: ''
});

const registerForm = reactive({
    username: '',
    phone: '',
    password: ''
});

const loginFormRef = ref();

// 验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名',HN: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

// 切换登录/注册模式
const toggleMode = () => {
    isRegister.value = !isRegister.value;
    activeTab.value = isRegister.value ? 'register' : 'account';
};

const handleTabClick = () => {
    // 处理 tab 切换逻辑
};

// 登录处理
const handleLogin = async () => {
  if (!isRegister && activeTab.value === 'account') {
      if (!loginFormRef.value) return;
      await loginFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            performLogin();
        }
      });
  } else {
      // 手机号登录逻辑简化
      performLogin();
  }
};

const performLogin = async () => {
    loading.value = true;
    try {
        await userStore.login(loginForm);
        router.push('/');
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

// 注册处理
const handleRegister = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        ElMessage.success('注册成功，请登录');
        toggleMode();
    }, 1500);
}
</script>

<style scoped lang="scss">
// 变量定义
$primary-color: #41B883; // Vue Green
$bg-gradient: linear-gradient(135deg, #41B883 0%, #35495E 100%);
$text-main: #303133;
$text-sub: #909399;

.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=3132&auto=format&fit=crop'); 
  background-size: cover;
  background-position: center;
  position: relative;
  
  // 遮罩层，让背景图片不那么抢眼
  &::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(4px);
  }
}

.login-box {
  position: relative;
  display: flex;
  width: 1000px;
  height: 600px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1;

  @media (max-width: 1024px) {
      width: 90%;
      height: auto;
      min-height: 500px;
  }
}

/* 左侧品牌区 */
.login-left {
  flex: 1;
  background: $bg-gradient;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  position: relative;
  overflow: hidden;

  // 响应式隐藏
  @media (max-width: 768px) {
      display: none;
  }

  .logo {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      img {
          height: 32px;
          margin-right: 10px;
          background: #fff;
          border-radius: 50%;
          padding: 2px;
      }
      span {
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 1px;
      }
  }

  .slogan {
      font-size: 36px;
      line-height: 1.3;
      margin-bottom: 20px;
      font-weight: 600;
  }

  .desc {
      font-size: 14px;
      opacity: 0.8;
      line-height: 1.6;
      max-width: 300px;
      z-index: 2;
  }

  .illustration {
      position: absolute;
      bottom: -50px;
      right: -50px;
      width: 100%;
      height: 300px;
      
      .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
      }
      .c1 { width: 200px; height: 200px; top: 0; right: 50px; }
      .c2 { width: 150px; height: 150px; bottom: 50px; left: 50px; }

      .glass-card {
          position: absolute;
          top: 60px;
          left: 40px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 15px 25px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          animation: float 6s ease-in-out infinite;

          span { margin-left: 10px; font-weight: bold; }
      }
  }
}

/* 右侧表单区 */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #fff;

  .form-wrapper {
      width: 100%;
      max-width: 360px;
  }
}

.welcome-text {
    font-size: 28px;
    color: $text-main;
    margin-bottom: 8px;
}
.sub-text {
    color: $text-sub;
    margin-bottom: 30px;
    font-size: 14px;
}

.custom-tabs {
    margin-bottom: 20px;
    :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
        background-color: #eee;
    }
}

.code-item {
    display: flex;
    :deep(.el-input) {
        flex: 1;
        margin-right: 10px;
    }
}

.actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.submit-btn {
    width: 100%;
    font-weight: bold;
    height: 44px;
    font-size: 16px;
    background-color: $primary-color;
    border-color: $primary-color;
    
    &:hover {
        opacity: 0.9;
    }
}

.footer-links {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: $text-sub;
    
    .link-text {
        color: $primary-color;
        cursor: pointer;
        font-weight: 500;
        margin-left: 5px;
        &:hover { text-decoration: underline; }
    }
}

.divider {
    margin: 30px 0 20px;
    position: relative;
    text-align: center;
    
    &::before {
        content: '';
        position: absolute;
        left: 0; top: 50%;
        width: 100%;
        height: 1px;
        background: #eee;
    }
    span {
        position: relative;
        background: #fff;
        padding: 0 10px;
        color: #bbb;
        font-size: 12px;
    }
}

.social-login {
    display: flex;
    justify-content: center;
    gap: 20px;
    
    .social-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        color: #666;

        &:hover {
            background: #e6e8eb;
            transform: translateY(-2px);
        }
        
        &.wechat:hover { color: #07c160; background: #e3f9eb; }
        &.apple:hover { color: #000; background: #ddd; }
    }
}

@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
}
</style>