// tianai-captcha 官方 Web SDK 全局类型声明
// SDK 通过 load.min.js 引入，挂载 window.loadTAC

interface TACConfig {
  /** 后端生成验证码接口地址 */
  requestCaptchaDataUrl: string;
  /** 后端校验验证码接口地址 */
  validCaptchaUrl: string;
  /** 绑定的 DOM 元素选择器，如 "#captcha-box" */
  bindEl: string;
  /** 验证成功回调 */
  validSuccess?: (res: any, c: any, tac: TACInstance) => void;
  /** 验证失败回调 */
  validFail?: (res: any, c: any, tac: TACInstance) => void;
  /** 刷新按钮回调 */
  btnRefreshFun?: (el: HTMLElement, tac: TACInstance) => void;
  /** 关闭按钮回调 */
  btnCloseFun?: (el: HTMLElement, tac: TACInstance) => void;
}

interface TACInstance {
  /** 初始化验证码 */
  init(): void;
  /** 销毁验证码弹窗 */
  destroyWindow(): void;
  /** 重新加载验证码 */
  reloadCaptcha(): void;
}

interface TACStyleConfig {
  logoUrl?: string;
}

interface Window {
  loadTAC?: (
    staticUrl: string,
    config: TACConfig,
    style?: TACStyleConfig
  ) => Promise<TACInstance>;
}
