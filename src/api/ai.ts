import type { ChatSession, ChatMessage, AiContext } from '@/types/ai';

const STORAGE_KEY = 'smart_nutri_ai_sessions';
const MAX_MESSAGES_PER_SESSION = 50;

function getStorage(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStorage(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function getSessions(): Promise<ChatSession[]> {
  return getStorage();
}

export async function createSession(): Promise<ChatSession> {
  const sessions = getStorage();
  const now = new Date().toISOString();
  const session: ChatSession = {
    id: genId(),
    title: '新会话',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  sessions.unshift(session);
  saveStorage(sessions);
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sessions = getStorage().filter((s) => s.id !== sessionId);
  saveStorage(sessions);
}

export async function getSession(sessionId: string): Promise<ChatSession | null> {
  const sessions = getStorage();
  return sessions.find((s) => s.id === sessionId) ?? null;
}

export async function sendMessage(
  sessionId: string,
  content: string,
  context?: AiContext
): Promise<ChatMessage> {
  const sessions = getStorage();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error('Session not found');

  // 用户消息
  const userMsg: ChatMessage = {
    id: genId(),
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  };
  session.messages.push(userMsg);

  // 更新标题为首条用户消息
  if (session.messages.length === 1) {
    session.title = content.slice(0, 20) + (content.length > 20 ? '…' : '');
  }

  // 构建系统提示词（含用户上下文）
  const systemPrompt = buildSystemPrompt(context);
  const conversationHistory = session.messages.slice(0, -1).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Mock AI 回复
  const aiResponse = await mockAiReply(content, session.messages.length, systemPrompt, context);

  const aiMsg: ChatMessage = {
    id: genId(),
    role: 'assistant',
    content: aiResponse,
    createdAt: new Date().toISOString(),
  };
  session.messages.push(aiMsg);

  // 限制单会话消息数量
  if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
    session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
  }

  session.updatedAt = new Date().toISOString();
  saveStorage(sessions);
  return aiMsg;
}

function buildSystemPrompt(context?: AiContext): string {
  if (!context) {
    return '你是一位专业、友善的智能营养健康管理助手，擅长饮食建议、运动指导和健康科普。请用简洁专业的语言回复，适当使用 Markdown 格式。';
  }
  const { userProfile, todayNutrition, todayActivity, remainingCalories } = context;
  return `你是一位专业、友善的智能营养健康管理助手，擅长饮食建议、运动指导和健康科普。

【用户档案】
- 性别：${userProfile.gender === 'male' ? '男' : '女'}
- 年龄：${userProfile.age}岁
- 身高：${userProfile.height}cm
- 体重：${userProfile.weight}kg
- BMI：${userProfile.bmi}
- 基础代谢率(BMR)：${userProfile.bmr} kcal/天
- 目标摄入：${userProfile.targetCalories} kcal/天
- 健康目标：${userProfile.goal === 'lose' ? '减脂' : userProfile.goal === 'gain' ? '增肌' : '维持体重'}

【今日营养摄入】
- 已摄入热量：${todayNutrition.consumedCalories} kcal
- 已摄入蛋白质：${todayNutrition.consumedProtein}g
- 已摄入碳水：${todayNutrition.consumedCarbs}g
- 已摄入脂肪：${todayNutrition.consumedFat}g

【今日运动消耗】
- 已消耗热量：${todayActivity.burnedCalories} kcal
- 运动时长：${todayActivity.exerciseMinutes} 分钟

【今日剩余热量】
- 剩余额度：${remainingCalories} kcal

请结合以上数据给出个性化建议。回复要简洁专业，适当使用 Markdown 格式（加粗、列表、表格等），不要超过200字。`;
}

async function mockAiReply(
  userMsg: string,
  _msgCount: number,
  systemPrompt: string,
  context?: AiContext
): Promise<string> {
  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));

  const lower = userMsg.toLowerCase();
  const remaining = context?.remainingCalories ?? 0;

  if (lower.includes('还能吃') || lower.includes('还能喝') || lower.includes('晚餐') || lower.includes('宵夜') || lower.includes('加餐')) {
    if (remaining > 200) {
      return `根据您今天的摄入情况，**剩余热量约 ${remaining} kcal**，以下是推荐食物：

| 食物 | 份量 | 热量 | 说明 |
|------|------|------|------|
| 苹果 1个 | 约200g | ~104 kcal | 富含膳食纤维，增加饱腹感 |
| 希腊酸奶 | 150g | ~145 kcal | 高蛋白低碳水，护肠胃 |
| 小番茄 | 150g | ~27 kcal | 低卡路里，富含番茄红素 |
| 每日坚果 | 25g | ~140 kcal | 健康不饱和脂肪酸来源 |

> 💡 **小贴士**：建议优先选择高蛋白或高纤维食物，既能补充营养又能延缓饥饿感。`;
    } else {
      return `您今天的热量预算**已经接近目标**，建议选择极低热量的食物：

- 🫐 **小番茄** 100g — 仅 18 kcal
- 🥒 **黄瓜** 半根 — 仅 15 kcal  
- ☕ **黑咖啡** 1杯 — 几乎零卡
- 🍵 **绿茶** 1杯 — 清油解腻

> ⚠️ 建议不要再摄入过多热量，可多喝温水促进代谢。`;
    }
  }

  if (lower.includes('食谱') || lower.includes('三餐') || lower.includes('菜谱') || lower.includes('早餐') || lower.includes('午餐') || lower.includes('减脂餐')) {
    const target = context?.userProfile.targetCalories ?? 2000;
    const goal = context?.userProfile.goal ?? 'maintain';
    const ratio = goal === 'lose' ? 0.75 : goal === 'gain' ? 1.15 : 1.0;
    const adjustedTarget = Math.round(target * ratio);
    return `为您量身定制的一份**${goal === 'lose' ? '减脂' : goal === 'gain' ? '增肌' : '均衡'}**一日三餐推荐（总热量约 ${adjustedTarget} kcal）：

### 早餐（约 30%）— ${Math.round(adjustedTarget * 0.3)} kcal
- 燕麦牛奶粥 1碗（约 300ml）+ 水煮蛋 2个
- 蓝莓 50g 或苹果半个

### 午餐（约 40%）— ${Math.round(adjustedTarget * 0.4)} kcal
- 糙米饭 150g + 清蒸鱼 150g + 西兰花 200g
- 少油少盐，可加柠檬汁调味

### 晚餐（约 30%）— ${Math.round(adjustedTarget * 0.3)} kcal
- 鸡胸肉沙拉（鸡胸肉 120g + 生菜 + 彩椒 + 橄榄油拌）
- 可配一小把杏仁（约15g）

> 📋 **营养提示**：每日蛋白质建议摄入 ${Math.round(context?.userProfile.weight ?? 70 * 1.2)}g，分配到三餐中更有利于吸收。`;
  }

  if (lower.includes('运动') || lower.includes('跑步') || lower.includes('锻炼') || lower.includes('拉伸')) {
    return `针对久坐上班族的运动建议：

### 推荐的日常运动方案

| 运动类型 | 时长 | 消耗热量（参考） |
|----------|------|-----------------|
| 快走 | 30分钟 | ~150 kcal |
| 慢跑 | 20分钟 | ~200 kcal |
| 瑜伽 | 30分钟 | ~120 kcal |
| 力量训练 | 40分钟 | ~220 kcal |

### 碎片化运动推荐（办公室）
- 每坐 1 小时，站起来活动 5 分钟
- 每天做 3 组 "1 分钟办公室拉伸"
- 上下班提前两站下车，步行到达

> 🏃 **坚持建议**：刚开始不必追求高强度，每天比前一天多动 10 分钟，一周后身体就会适应。`;
  }

  if (lower.includes('分析') || lower.includes('评估') || lower.includes('检查')) {
    const consumed = context?.todayNutrition.consumedCalories ?? 0;
    const burned = context?.todayActivity.burnedCalories ?? 0;
    const ratio = consumed / (context?.userProfile.targetCalories ?? 2000);
    let status = '';
    if (ratio < 0.6) status = '**摄入不足**，建议适当加餐补充优质蛋白';
    else if (ratio < 0.9) status = '**摄入良好**，热量控制在合理区间';
    else if (ratio < 1.1) status = '**摄入达标**，精准卡路里管理';
    else status = '**摄入超标**，建议增加运动消耗或减少晚餐份量';
    return `## 今日饮食分析报告

### 热量摄入
- 目标：${context?.userProfile.targetCalories ?? 2000} kcal
- 已摄入：${consumed} kcal
- 已消耗：${burned} kcal
- 热量平衡：${remaining} kcal

### 营养素评估
- 蛋白质：${context?.todayNutrition.consumedProtein ?? 0}g（建议 ${Math.round((context?.userProfile.weight ?? 70) * 1.2)}g）
- 碳水：${context?.todayNutrition.consumedCarbs ?? 0}g
- 脂肪：${context?.todayNutrition.consumedFat ?? 0}g

### 综合评估
${status}

${burned > 100 ? '✅ 今日有运动记录，继续保持！' : '💡 建议今天完成至少 20 分钟中等强度运动。'}`;
  }

  if (lower.includes('喝水') || lower.includes('水')) {
    return `关于饮水建议：

> 💧 **每日建议饮水量**：体重(kg) × 30~35 ml
> 以您的体重 ${context?.userProfile.weight ?? 70}kg 计算，建议每天饮水 **${Math.round((context?.userProfile.weight ?? 70) * 35)} ml** 左右

### 饮水时间表
- �早起：起床后喝 1 杯温水（促进肠胃蠕动）
- 🍱 午餐前：餐前 30 分钟喝半杯（减少进食量）
- 🏃 运动后：补充 200-300ml（含电解质更好）
- 🌙 睡前：少量饮水，避免血液黏稠

> ⚠️ 肾病患者或心衰患者请遵医嘱调整饮水量。`;
  }

  if (lower.includes('bmi') || lower.includes('体质')) {
    const bmi = context?.userProfile.bmi ?? 22;
    const weight = context?.userProfile.weight ?? 70;
    const height = context?.userProfile.height ?? 175;
    let category = '';
    if (bmi < 18.5) category = '体重过轻';
    else if (bmi < 24) category = '正常范围';
    else if (bmi < 28) category = '超重';
    else category = '肥胖';
    return `## BMI 评估

您的 BMI = **${bmi}**（体重 ${weight}kg / 身高 ${height}cm）

| BMI 范围 | 分类 |
|----------|------|
| < 18.5 | 体重过轻 |
| 18.5 - 24 | ✅ 正常 |
| 24 - 28 | ⚠️ 超重 |
| > 28 | 🚨 肥胖 |

**当前评估**：${category}

> 📌 BMI 是通用指标，不能区分肌肉和脂肪含量，运动员或肌肉量较高的人群请结合体脂率综合判断。`;
  }

  // 默认回复
  return `您好！我是您的智能营养管理助手 😊

我可以帮您：

- 📊 **分析今日饮食**：告诉我您吃了什么，我来帮您评估
- 🍽️ **推荐食物**：根据您今天剩余热量推荐合适的餐点
- 🏋️ **运动建议**：根据您的身体情况推荐适合的运动
- 📋 **定制食谱**：帮您规划一日三餐营养摄入

请告诉我您现在有什么需要帮助的？`;
}
