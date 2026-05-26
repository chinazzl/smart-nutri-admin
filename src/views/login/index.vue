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
                        {{ isRegister ? "创建账号" : "欢迎登录" }}
                    </h2>
                    <p class="sub-text">
                        {{
                            isRegister
                                ? "开启您的健康之旅"
                                : "请通过安全验证后登录"
                        }}
                    </p>

                    <!-- ========== 登录表单 ========== -->
                    <template v-if="!isRegister">
                        <el-tabs
                            v-model="activeTab"
                            class="custom-tabs"
                            @tab-click="handleTabClick"
                        >
                            <!-- 账号密码登录 -->
                            <el-tab-pane label="账号登录" name="account">
                                <el-form
                                    ref="loginFormRef"
                                    :model="loginForm"
                                    :rules="loginRules"
                                    size="large"
                                >
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
                                        />
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>

                            <!-- 手机号登录 -->
                            <el-tab-pane label="手机登录" name="phone">
                                <el-form :model="loginForm" size="large">
                                    <el-form-item>
                                        <el-input
                                            v-model="loginForm.phone"
                                            placeholder="手机号码"
                                            :prefix-icon="Iphone"
                                        />
                                    </el-form-item>
                                    <el-form-item class="code-item">
                                        <el-input
                                            v-model="loginForm.code"
                                            placeholder="验证码"
                                            :prefix-icon="Message"
                                        />
                                        <el-button
                                            class="send-btn"
                                            type="primary"
                                            link
                                            >获取验证码</el-button
                                        >
                                    </el-form-item>
                                </el-form>
                            </el-tab-pane>
                        </el-tabs>

                        <!-- 辅助功能区 -->
                        <div class="actions">
                            <el-checkbox v-model="rememberMe"
                                >记住我</el-checkbox
                            >
                            <el-link type="primary" :underline="false"
                                >忘记密码?</el-link
                            >
                        </div>

                        <!-- tianai-captcha 容器（TAC 会将验证码 UI 渲染到此处） -->
                        <div
                            id="captcha-container"
                            class="captcha-container"
                        ></div>

                        <!-- 登录按钮 -->
                        <el-button
                            type="primary"
                            class="submit-btn"
                            :loading="loading"
                            size="large"
                            @click="handleLoginClick"
                        >
                            {{ loading ? "验证中..." : "登 录" }}
                        </el-button>

                        <!-- 第三方登录 -->
                        <div class="divider"><span>其他方式登录</span></div>
                        <div class="social-login">
                            <div class="social-icon wechat">
                                <el-icon><ChatDotRound /></el-icon>
                            </div>
                        </div>
                    </template>

                    <!-- ========== 注册表单 ========== -->
                    <template v-else>
                        <el-form
                            ref="registerFormRef"
                            :model="registerForm"
                            :rules="registerRules"
                            size="large"
                            class="register-form"
                        >
                            <!-- 邮箱或手机号 -->
                            <el-form-item prop="account">
                                <el-input
                                    v-model="registerForm.account"
                                    :placeholder="accountPlaceholder"
                                    :prefix-icon="accountIcon"
                                    clearable
                                >
                                    <template #suffix>
                                        <span
                                            v-if="accountType"
                                            class="account-type-tag"
                                            :class="accountType"
                                        >
                                            {{
                                                accountType === "email"
                                                    ? "邮箱"
                                                    : "手机号"
                                            }}
                                        </span>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <!-- 密码 -->
                            <el-form-item prop="password">
                                <el-input
                                    v-model="registerForm.password"
                                    type="password"
                                    placeholder="设置密码（至少6位）"
                                    show-password
                                    :prefix-icon="Lock"
                                />
                            </el-form-item>
                            <!-- 确认密码 -->
                            <el-form-item prop="confirmPassword">
                                <el-input
                                    v-model="registerForm.confirmPassword"
                                    type="password"
                                    placeholder="确认密码"
                                    show-password
                                    :prefix-icon="Lock"
                                />
                            </el-form-item>
                        </el-form>

                        <!-- 注册按钮 -->
                        <el-button
                            type="primary"
                            class="submit-btn"
                            :loading="loading"
                            size="large"
                            @click="handleRegisterClick"
                        >
                            立即注册
                        </el-button>
                    </template>

                    <!-- 底部切换 -->
                    <div class="footer-links">
                        <span v-if="!isRegister">
                            还没有账号?
                            <span class="link-text" @click="toggleMode"
                                >立即注册</span
                            >
                        </span>
                        <span v-else>
                            已有账号?
                            <span class="link-text" @click="toggleMode"
                                >去登录</span
                            >
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from "vue";
import {
    User,
    Lock,
    Iphone,
    Message,
    TrendCharts,
    ChatDotRound,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";
import { ElMessage, type FormInstance } from "element-plus";

const userStore = useUserStore();
const tacStaticUrl =
    import.meta.env.VITE_TAC_STATIC_URL || "/tac";
const captchaGenerateUrl =
    import.meta.env.VITE_CAPTCHA_GENERATE_URL || "/api/auth/captcha/generate";
const captchaCheckUrl =
    import.meta.env.VITE_CAPTCHA_CHECK_URL || "/api/auth/captcha/verify";

// ──────────────── 状态 ────────────────
const isRegister = ref(false);
const activeTab = ref("account");
const loading = ref(false);
const rememberMe = ref(true);

// ──────────────── 表单数据 ────────────────
const loginForm = reactive({
    username: "",
    password: "",
    phone: "",
    code: "",
});

const registerForm = reactive({
    account: "",
    password: "",
    confirmPassword: "",
});

const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();

// ──────────────── 账号类型自动识别 ────────────────
const accountType = computed(() => {
    const v = registerForm.account;
    if (!v) return null;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email";
    if (/^1[3-9]\d{9}$/.test(v)) return "phone";
    return null;
});

const accountIcon = computed(() =>
    accountType.value === "email" ? Message : Iphone,
);
const accountPlaceholder = "邮箱或手机号";

// ──────────────── 验证规则 ────────────────
const loginRules = {
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const registerRules = {
    account: [
        { required: true, message: "请输入邮箱或手机号", trigger: "blur" },
        {
            validator: (_rule: any, value: string, callback: any) => {
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                const isPhone = /^1[3-9]\d{9}$/.test(value);
                if (!isEmail && !isPhone) {
                    callback(new Error("请输入有效的邮箱地址或11位手机号"));
                } else {
                    callback();
                }
            },
            trigger: "blur",
        },
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码不能少于6位", trigger: "blur" },
    ],
    confirmPassword: [
        { required: true, message: "请再次输入密码", trigger: "blur" },
        {
            validator: (_rule: any, value: string, callback: any) => {
                if (value !== registerForm.password) {
                    callback(new Error("两次输入密码不一致"));
                } else {
                    callback();
                }
            },
            trigger: "blur",
        },
    ],
};

// ──────────────── 模式切换 ────────────────
const toggleMode = () => {
    isRegister.value = !isRegister.value;
    activeTab.value = "account";
};

const handleTabClick = () => {};

// ──────────────── 登录：点击按钮 → 弹出 tianai-captcha → 通过后调用接口 ────────────────
const handleLoginClick = async () => {
    if (loading.value) return;

    // 账号密码登录需校验表单
    if (activeTab.value === "account") {
        if (!loginFormRef.value) return;
        const valid = await loginFormRef.value.validate().catch(() => false);
        if (!valid) return;
    }
    // 初始化 tianai-captcha
    await nextTick();
    initTAC();
};

/** 初始化 TAC 验证码 */
let tacInitialized = false;
const initTAC = () => {
    if (tacInitialized) return;
    tacInitialized = true;

    const el = document.getElementById("captcha-container");
    if (!el) {
        ElMessage.error("验证码容器未找到，请刷新页面");
        return;
    }

    if (!window.loadTAC) {
        ElMessage.error(
            "tianai-captcha SDK 未加载，请检查 index.html 中的 load.min.js",
        );
        return;
    }

    loading.value = true;

    window
        .loadTAC(tacStaticUrl, {
            requestCaptchaDataUrl: captchaGenerateUrl,
            validCaptchaUrl: captchaCheckUrl,
            bindEl: "#captcha-container",
            validSuccess: (res, _config, currentTac) => {
                const token = extractCaptchaToken(res);

                // 用 setTimeout 把登录延迟到下一个宏任务，避开 TAC 内部的回调链
                setTimeout(() => {
                    if (token) {
                        currentTac.destroyWindow();
                        performLogin(token);
                    } else {
                        currentTac.destroyWindow();
                        ElMessage.error("无法获取验证码凭证，请重试");
                        loading.value = false;
                    }
                    tacInitialized = false;
                }, 0);
            },
            validFail: (_res, _config, currentTac) => {
                ElMessage.warning("验证未通过，请重新拖动滑块");
                currentTac.reloadCaptcha();
            },
            btnRefreshFun: (_el, currentTac) => {
                currentTac.reloadCaptcha();
            },
            btnCloseFun: (_el, currentTac) => {
                currentTac.destroyWindow();
                loading.value = false;
            },
        })
        .then((tac) => {
            tac.init();
        })
        .catch((error) => {
            console.error("tianai-captcha 加载失败：", error);
            ElMessage.error("验证码加载失败，请稍后重试");
            loading.value = false;
        });
};

const extractCaptchaToken = (res: any): string | undefined => {
    return (
        res?.data?.captchaToken ||
        res?.data?.token ||
        res?.captchaToken ||
        res?.token ||
        res?.id
    );
};

/** 验证通过后执行登录 */
let isLoggingIn = false;
const performLogin = async (captchaToken?: string) => {
    if (isLoggingIn) {
        console.warn("[Login] 登录已在进行中，忽略重复调用");
        return;
    }
    isLoggingIn = true;

    loading.value = true;
    try {
        await userStore.login({
            username: loginForm.username,
            password: loginForm.password,
            phone: loginForm.phone,
            code: loginForm.code,
            captchaToken,
            rememberMe: rememberMe.value,
        });
    } catch (error) {
        console.error("登录失败：", error);
    } finally {
        loading.value = false;
        isLoggingIn = false;
    }
};

// ──────────────── 注册 ────────────────
const handleRegisterClick = async () => {
    if (!registerFormRef.value) return;
    const valid = await registerFormRef.value.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        await userStore.register({
            account: registerForm.account,
            password: registerForm.password,
        });
        // 清空表单并切回登录
        registerForm.account = "";
        registerForm.password = "";
        registerForm.confirmPassword = "";
        toggleMode();
    } catch (error) {
        console.error("注册失败：", error);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped lang="scss">
$primary: #41b883;
$bg-gradient: linear-gradient(135deg, #41b883 0%, #35495e 100%);
$text-main: #303133;
$text-sub: #909399;

/* ───── 页面容器 ───── */
.login-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url("https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=3132&auto=format&fit=crop");
    background-size: cover;
    background-position: center;
    position: relative;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.22);
        backdrop-filter: blur(4px);
    }
}

/* ───── 卡片 ───── */
.login-box {
    position: relative;
    z-index: 1;
    display: flex;
    width: 1000px;
    min-height: 580px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
    overflow: hidden;

    @media (max-width: 1024px) {
        width: 90%;
    }
}

/* ───── 左侧品牌区 ───── */
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
        font-size: 34px;
        line-height: 1.35;
        margin-bottom: 20px;
        font-weight: 600;
    }
    .desc {
        font-size: 14px;
        opacity: 0.8;
        line-height: 1.6;
        max-width: 300px;
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
        .c1 {
            width: 200px;
            height: 200px;
            top: 0;
            right: 50px;
        }
        .c2 {
            width: 150px;
            height: 150px;
            bottom: 50px;
            left: 50px;
        }

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
            animation: float 6s ease-in-out infinite;
            span {
                margin-left: 10px;
                font-weight: bold;
            }
        }
    }
}

/* ───── 右侧表单区 ───── */
.login-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: #fff;

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
    font-size: 14px;
    margin-bottom: 28px;
}

/* ───── Tabs ───── */
.custom-tabs {
    margin-bottom: 16px;
    :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
        background-color: #eee;
    }
}

/* ───── 辅助功能 ───── */
.actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

/* ───── tianai-captcha 容器 ───── */
.captcha-container {
    margin-bottom: 16px;
    min-height: 0;
    // TAC 会自动向此 div 注入验证码 UI
    :deep(.tac-modal) {
        border-radius: 10px;
    }
}

/* ───── 提交按钮 ───── */
.submit-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: bold;
    background-color: $primary;
    border-color: $primary;
    &:hover {
        opacity: 0.9;
    }
}

/* ───── 注册表单 ───── */
.register-form {
    margin-top: 8px;
}

/* ───── 账号类型标签 ───── */
.account-type-tag {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 4px;
    font-weight: 500;
    line-height: 1.6;

    &.email {
        color: #409eff;
        background: #ecf5ff;
        border: 1px solid #b3d8ff;
    }
    &.phone {
        color: #67c23a;
        background: #f0f9eb;
        border: 1px solid #c2e7b0;
    }
}

/* ───── 验证码发送 ───── */
.code-item {
    :deep(.el-input) {
        flex: 1;
        margin-right: 10px;
    }
}

/* ───── 底部链接 ───── */
.footer-links {
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: $text-sub;

    .link-text {
        color: $primary;
        cursor: pointer;
        font-weight: 500;
        margin-left: 5px;
        &:hover {
            text-decoration: underline;
        }
    }
}

/* ───── 第三方登录 ───── */
.divider {
    margin: 24px 0 16px;
    position: relative;
    text-align: center;
    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
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
        &.wechat:hover {
            color: #07c160;
            background: #e3f9eb;
        }
    }
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
    100% {
        transform: translateY(0px);
    }
}
</style>
