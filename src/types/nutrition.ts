// 饮食模块相关类型定义

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionInfo {
  calories: number;    // 千卡
  protein: number;     // 克
  carbs: number;       // 克
  fat: number;         // 克
  fiber?: number;      // 克（可选）
}

export interface Food {
  id: string;
  name: string;
  nameEn?: string;
  category: string;       // 如 '主食' | '肉类' | '蔬菜' | '水果' | '奶制品' | '饮品' | '零食' | '坚果'
  unit: string;          // 默认单位，如 'g' | 'ml' | '个'
  perHundred: NutritionInfo; // 每100g/ml的营养素含量
  glycemicIndex?: 'low' | 'medium' | 'high'; // 血糖指数
  tags?: string[];       // 如 ['clean', 'low-carb', 'high-protein']
  defaultWeight?: number; // 默认推荐克数
}

export interface DietLog {
  id: string;
  date: string;           // YYYY-MM-DD 格式
  mealType: MealType;
  food: Food;
  weight: number;         // 实际摄入克数
  nutrition: NutritionInfo; // 根据实际克数计算后的营养素
  createdAt: string;      // ISO 时间戳
  updatedAt: string;
}

export interface DayNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logs: DietLog[];
  goalCalories?: number;
}

export interface MonthlyNutritionData {
  [date: string]: DayNutritionSummary;
}

export interface MealPeriod {
  label: string;
  value: MealType;
  icon: string;
  timeRange: string;
}

export const MEAL_PERIODS: MealPeriod[] = [
  { label: '早餐', value: 'breakfast', icon: 'Sunrise', timeRange: '06:00-09:00' },
  { label: '午餐', value: 'lunch', icon: 'Sunny', timeRange: '11:00-13:00' },
  { label: '晚餐', value: 'dinner', icon: 'Moon', timeRange: '17:00-19:00' },
  { label: '加餐', value: 'snack', icon: 'Bowl', timeRange: '任意时间' },
];

export function calcNutrition(food: Food, weight: number): NutritionInfo {
  const factor = weight / 100;
  return {
    calories: Math.round(food.perHundred.calories * factor),
    protein: Math.round(food.perHundred.protein * factor * 10) / 10,
    carbs: Math.round(food.perHundred.carbs * factor * 10) / 10,
    fat: Math.round(food.perHundred.fat * factor * 10) / 10,
    fiber: food.perHundred.fiber ? Math.round(food.perHundred.fiber * factor * 10) / 10 : undefined,
  };
}
