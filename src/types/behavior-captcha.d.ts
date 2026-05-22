// tianai-captcha 官方 TAC SDK 全局类型声明
// SDK 通过 CDN 引入，挂载在 window.TAC

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
  /** 验证码刷新回调 */
  execute?: (res: any, c: any, tac: TACInstance) => void;
}

interface TACInstance {
  /** 销毁验证码弹窗 */
  destroyWindow(): void;
  /** 重新加载验证码 */
  reloadCaptcha(): void;
}

interface TACConstructor {
  new(config: TACConfig): {
    init(): TACInstance;
  };
}

declare const TAC: TACConstructor;
