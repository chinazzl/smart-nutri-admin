<template>
  <div class="login-container">
    <!-- 左侧装饰区域 -->
    <div class="login-left">
      <div class="bg-animation">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
      <div class="content">
        <h1 class="title">智能营养管理系统</h1>
        <p class="subtitle">AI驱动的个性化健康饮食方案</p>
        <div class="features">
          <div class="feature-item">
            <el-icon size="32"><Apple /></el-icon>
            <span>智能饮食分析</span>
          </div>
          <div class="feature-item">
            <el-icon size="32"><TrendCharts /></el-icon>
            <span>健康数据追踪</span>
          </div>
          <div class="feature-item">
            <el-icon size="32"><ChatDotRound /></el-icon>
            <span>AI营养顾问</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录/注册表单 -->
    <div class="login-right">
      <div class="form-wrapper">
        <div class="form-header">
          <h2 :class="{ active: !isRegister }" @click="isRegister = false">登录</h2>
          <h2 :class="{ active: isRegister }" @click="isRegister = true">注册</h2>
          <div class="underline" :style="{ left: isRegister ? '50%' : '0' }"></div>
        </div>

        <!-- 登录表单 -->
        <el-form
          v-show="!isRegister"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名/手机号/邮箱"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <div class="form-footer">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loginLoading"
            @click="handleLogin"
          >
            登录
          </el-button>
          <div class="social-login">
            <p>快速登录</p>
            <div class="social-icons">
              <el-tooltip content="微信登录" placement="bottom">
                <div class="social-icon wechat">
                  <el-icon size="24"><ChatDotRound /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip content="QQ登录" placement="bottom">
                <div class="social-icon qq">
                  <el-icon size="24"><User /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip content="支付宝登录" placement="bottom">
                <div class="social-icon alipay">
                  <el-icon size="24"><WalletFilled /></el-icon>
                </div>
              </el-tooltip>
            </div>
          </div>
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-show="isRegister"
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              size="large"
              :prefix-icon="Iphone"
            />
          </el-form-item>
          <el-form-item prop="code">
            <el-input
              v-model="registerForm.code"
              placeholder="请输入验证码"
              size="large"
              :prefix-icon="Message"
            >
              <template #append>
                <el-button
                  :disabled="countdown > 0"
                  @click="sendCode"
                >
                  {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（6-20位）"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleRegister"
            />
          </el-form-item>
          <el-form-item prop="agree">
            <el-checkbox v-model="registerForm.agree">
              我已阅读并同意
              <el-link type="primary" :underline="false">《用户协议》</el-link>
              和
              <el-link type="primary" :underline="false">《隐私政策》</el-link>
            </el-checkbox>
          </el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="registerLoading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance } from 'element-plus';
import { User, Lock, Iphone, Message, WalletFilled } from '@element-plus/icons-vue';

const router = useRouter();

// 控制显示登录/注册
const isRegister = ref(false);
const rememberMe = ref(false);
const loginLoading = ref(false);
const registerLoading = ref(false);
const countdown = ref(0);

// 登录表单
const loginFormRef = ref<FormInstance>();
const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
};

// 注册表单
const registerFormRef = ref<FormInstance>();
const registerForm = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  agree: false
});

const validatePhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'));
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const validateAgree = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议'));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
  agree: [{ validator: validateAgree, trigger: 'change' }]
};

// 发送验证码
const sendCode = () => {
  if (!registerForm.phone) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }
  
  // 模拟发送验证码
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
  
  ElMessage.success('验证码已发送');
};

// 登录处理
const handleLogin = () => {
  loginFormRef.value?.validate((valid) => {
    if (valid) {
      loginLoading.value = true;
      
      // 模拟登录请求
      setTimeout(() => {
        loginLoading.value = false;
        
        // 保存token（实际项目中应从后端获取）
        localStorage.setItem('userToken', 'mock-token-' + Date.now());
        
        ElMessage.success('登录成功');
        router.push('/dashboard');
      }, 1000);
    }
  });
};

// 注册处理
const handleRegister = () => {
  registerFormRef.value?.validate((valid) => {
    if (valid) {
      registerLoading.value = true;
      
      // 模拟注册请求
      setTimeout(() => {
        registerLoading.value = false;
        ElMessage.success('注册成功，即将跳转登录');
        
        // 切换到登录页面
        isRegister.value = false;
        
        // 清空注册表单
        registerForm.username = '';
        registerForm.phone = '';
        registerForm.code = '';
        registerForm.password = '';
        registerForm.confirmPassword = '';
        registerForm.agree = false;
      }, 1000);
    }
  });
};
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

// 左侧装饰区域
.login-left {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .bg-animation {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 20s infinite;

      &.circle-1 {
        width: 300px;
        height: 300px;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 200px;
        height: 200px;
        bottom: 20%;
        right: 15%;
        animation-delay: 4s;
      }

      &.circle-3 {
        width: 150px;
        height: 150px;
        top: 50%;
        left: 50%;
        animation-delay: 2s;
      }
    }
  }

  .content {
    position: relative;
    z-index: 1;
    color: white;
    text-align: center;
    padding: 40px;

    .title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .subtitle {
      font-size: 20px;
      margin-bottom: 60px;
      opacity: 0.9;
    }

    .features {
      display: flex;
      justify-content: space-around;
      gap: 40px;

      .feature-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        
        span {
          font-size: 16px;
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-30px) translateX(30px);
  }
  66% {
    transform: translateY(30px) translateX(-30px);
  }
}

// 右侧表单区域
.login-right {
  width: 500px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
}

.form-wrapper {
  width: 100%;
  max-width: 400px;

  .form-header {
    display: flex;
    justify-content: space-around;
    margin-bottom: 40px;
    position: relative;

    h2 {
      font-size: 24px;
      cursor: pointer;
      color: #999;
      transition: all 0.3s;
      padding-bottom: 10px;

      &.active {
        color: #409EFF;
        font-weight: bold;
      }
    }

    .underline {
      position: absolute;
      bottom: 0;
      width: 50%;
      height: 3px;
      background: #409EFF;
      transition: left 0.3s;
      border-radius: 2px;
    }
  }

  .login-form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .submit-btn {
      width: 100%;
      height: 45px;
      font-size: 16px;
      border-radius: 8px;
    }

    .social-login {
      margin-top: 30px;
      text-align: center;

      p {
        color: #999;
        margin-bottom: 20px;
        position: relative;

        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30%;
          height: 1px;
          background: #ddd;
        }

        &::before {
          left: 0;
        }

        &::after {
          right: 0;
        }
      }

      .social-icons {
        display: flex;
        justify-content: center;
        gap: 20px;

        .social-icon {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: white;

          &:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          &.wechat {
            background: #07c160;
          }

          &.qq {
            background: #12b7f5;
          }

          &.alipay {
            background: #1677ff;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-left {
    display: none;
  }

  .login-right {
    width: 100%;
  }
}
</style>