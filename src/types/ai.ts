// AI 健康助手相关类型定义

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;     // 支持 Markdown 文本
  createdAt: string;   // ISO 时间戳
}

export interface ChatSession {
  id: string;
  title: string;       // 首条用户消息的前 20 字符
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AiContext {
  userProfile: {
    gender: string;
    age: number;
    height: number;
    weight: number;
    bmi: number;
    bmr: number;
    targetCalories: number;
    goal: string;
  };
  todayNutrition: {
    consumedCalories: number;
    consumedProtein: number;
    consumedCarbs: number;
    consumedFat: number;
  };
  todayActivity: {
    burnedCalories: number;
    exerciseMinutes: number;
  };
  remainingCalories: number;
}

export interface QuickQuestion {
  id: string;
  label: string;
  icon: string;
}

export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: 'what-to-eat', label: '我今天还能吃什么？', icon: 'Bowl' },
  { id: 'meal-plan', label: '帮我制定一份减脂食谱', icon: 'Document' },
  { id: 'exercise-advice', label: '适合我体质的运动建议', icon: 'DataAnalysis' },
  { id: 'nutrition-check', label: '分析我今天的饮食', icon: 'PieChart' },
  { id: 'water-advice', label: '我今天喝够水了吗？', icon: 'CoffeeCup' },
  { id: 'calorie-gaps', label: '我还差多少卡路里？', icon: 'Odometer' },
];
