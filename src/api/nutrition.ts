import type { Food, DietLog, MonthlyNutritionData, MealType, NutritionInfo, calcNutrition } from '@/types/nutrition';
import foodsData from '@/data/foods.json';

const STORAGE_KEY = 'smart_nutri_diet';
const MAX_MONTHS = 3;

function getStorage(): MonthlyNutritionData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStorage(data: MonthlyNutritionData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function cleanOldMonths(data: MonthlyNutritionData): MonthlyNutritionData {
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - MAX_MONTHS, 1);
  const cutoffStr = cutoff.toISOString().slice(0, 7);
  const cleaned: MonthlyNutritionData = {};
  for (const [key, val] of Object.entries(data)) {
    if (key >= cutoffStr) cleaned[key] = val;
  }
  return cleaned;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

export const allFoods: Food[] = foodsData.foods as Food[];

export function searchFoods(keyword: string): Food[] {
  if (!keyword.trim()) return allFoods;
  const kw = keyword.toLowerCase();
  return allFoods.filter(
    (f) =>
      f.name.toLowerCase().includes(kw) ||
      (f.nameEn && f.nameEn.toLowerCase().includes(kw)) ||
      f.category.toLowerCase().includes(kw) ||
      (f.tags && f.tags.some((t) => t.toLowerCase().includes(kw)))
  );
}

export function getFoodById(id: string): Food | undefined {
  return allFoods.find((f) => f.id === id);
}

function calcNutrition(food: Food, weight: number): NutritionInfo {
  const factor = weight / 100;
  return {
    calories: Math.round(food.perHundred.calories * factor),
    protein: Math.round(food.perHundred.protein * factor * 10) / 10,
    carbs: Math.round(food.perHundred.carbs * factor * 10) / 10,
    fat: Math.round(food.perHundred.fat * factor * 10) / 10,
    fiber: food.perHundred.fiber ? Math.round(food.perHundred.fiber * factor * 10) / 10 : undefined,
  };
}

export async function getLogsByDate(date: string): Promise<DietLog[]> {
  const monthKey = getMonthKey(date);
  const data = getStorage();
  return data[monthKey]?.find((d) => d.date === date)?.logs ?? [];
}

export async function addLog(
  date: string,
  mealType: MealType,
  food: Food,
  weight: number
): Promise<DietLog> {
  const data = getStorage();
  const monthKey = getMonthKey(date);
  if (!data[monthKey]) data[monthKey] = [];

  const monthEntry = data[monthKey];
  let dayEntry = monthEntry.find((d: any) => d.date === date);

  const log: DietLog = {
    id: genId(),
    date,
    mealType,
    food,
    weight,
    nutrition: calcNutrition(food, weight),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!dayEntry) {
    dayEntry = {
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      logs: [],
    };
    monthEntry.push(dayEntry);
  }

  dayEntry.logs.push(log);
  dayEntry.totalCalories += log.nutrition.calories;
  dayEntry.totalProtein += log.nutrition.protein;
  dayEntry.totalCarbs += log.nutrition.carbs;
  dayEntry.totalFat += log.nutrition.fat;

  saveStorage(cleanOldMonths(data));
  return log;
}

export async function updateLog(logId: string, date: string, weight: number): Promise<void> {
  const data = getStorage();
  const monthKey = getMonthKey(date);
  const monthEntry = data[monthKey];
  if (!monthEntry) return;

  const dayEntry = monthEntry.find((d: any) => d.date === date);
  if (!dayEntry) return;

  const logIndex = dayEntry.logs.findIndex((l: DietLog) => l.id === logId);
  if (logIndex === -1) return;

  const oldLog = dayEntry.logs[logIndex];
  dayEntry.totalCalories -= oldLog.nutrition.calories;
  dayEntry.totalProtein -= oldLog.nutrition.protein;
  dayEntry.totalCarbs -= oldLog.nutrition.carbs;
  dayEntry.totalFat -= oldLog.nutrition.fat;

  const newNutrition = calcNutrition(oldLog.food, weight);
  dayEntry.logs[logIndex] = {
    ...oldLog,
    weight,
    nutrition: newNutrition,
    updatedAt: new Date().toISOString(),
  };

  dayEntry.totalCalories += newNutrition.calories;
  dayEntry.totalProtein += newNutrition.protein;
  dayEntry.totalCarbs += newNutrition.carbs;
  dayEntry.totalFat += newNutrition.fat;

  saveStorage(data);
}

export async function deleteLog(logId: string, date: string): Promise<void> {
  const data = getStorage();
  const monthKey = getMonthKey(date);
  const monthEntry = data[monthKey];
  if (!monthEntry) return;

  const dayEntry = monthEntry.find((d: any) => d.date === date);
  if (!dayEntry) return;

  const logIndex = dayEntry.logs.findIndex((l: DietLog) => l.id === logId);
  if (logIndex === -1) return;

  const log = dayEntry.logs[logIndex];
  dayEntry.totalCalories -= log.nutrition.calories;
  dayEntry.totalProtein -= log.nutrition.protein;
  dayEntry.totalCarbs -= log.nutrition.carbs;
  dayEntry.totalFat -= log.nutrition.fat;

  dayEntry.logs.splice(logIndex, 1);
  saveStorage(data);
}

export async function getMonthlyData(year: number, month: number): Promise<any[]> {
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const data = getStorage();
  return data[monthKey] ?? [];
}

// AI NLP 解析引擎：自然语言 → 结构化饮食记录
interface ParsedFoodItem {
  food: Food | null;
  weight: number;
  mealType: MealType;
}

const MEAL_KEYWORDS: Record<MealType, string[]> = {
  breakfast: ['早餐', '早饭', '早', '早上', 'Morning', 'breakfast'],
  lunch: ['午餐', '午饭', '中', '中午', 'Lunch', 'lunch'],
  dinner: ['晚餐', '晚饭', '晚', '晚上', 'Dinner', 'dinner'],
  snack: ['加餐', '零食', '小吃', '下午茶', '宵夜', '夜宵', 'Snack', 'snack'],
};

function detectMealType(text: string): MealType {
  const lower = text.toLowerCase();
  for (const [type, kws] of Object.entries(MEAL_KEYWORDS)) {
    if (kws.some((k) => lower.includes(k))) return type as MealType;
  }
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 18) return 'snack';
  return 'dinner';
}

function fuzzyMatchFood(text: string): Food | null {
  const lower = text.toLowerCase();
  // 精确匹配名称
  let best: Food | null = null;
  let bestScore = 0;

  for (const food of allFoods) {
    let score = 0;
    const name = food.name;
    const nameLower = name.toLowerCase();

    // 包含完整关键词
    if (nameLower.includes(lower)) score = 10;
    else if (lower.includes(nameLower)) score = 9;
    else {
      // 关键词匹配名称片段
      const tokens = lower.split(/[\s,，、]+/).filter(Boolean);
      const matched = tokens.filter((t) => nameLower.includes(t)).length;
      score = matched / tokens.length * 5;
    }

    if (score > bestScore) {
      bestScore = score;
      best = food;
    }
  }

  return bestScore >= 2 ? best : null;
}

function extractWeight(text: string, food: Food): number {
  // 提取数字 + 单位（个、杯、碗、根、片、包）
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(个|杯|碗|根|片|包|瓶|罐)/,
    /(\d+(?:\.\d+)?)\s*(g|克|kg|千克|ml|毫升)/i,
    /(\d+(?:\.\d+)?)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      let val = parseFloat(m[1]);
      const unit = m[2] || m[0].replace(/[\d.]/g, '');
      if (/个|杯|碗|根|片|包|瓶|罐/.test(unit) && food.defaultWeight) {
        val = val * food.defaultWeight;
      } else if (/kg|千克/.test(unit)) {
        val = val * 1000;
      } else if (/ml/.test(unit)) {
        val = val;
      }
      return Math.round(val);
    }
  }
  return food.defaultWeight ?? 100;
}

export function parseNaturalLanguage(text: string): ParsedFoodItem[] {
  // 按句号、逗号、分号拆分
  const sentences = text.split(/[，,；;。\n]+/).map((s) => s.trim()).filter(Boolean);
  return sentences.map((sentence) => {
    const food = fuzzyMatchFood(sentence);
    if (!food) return { food: null, weight: 0, mealType: 'snack' as MealType };
    const weight = extractWeight(sentence, food);
    const mealType = detectMealType(sentence);
    return { food, weight, mealType };
  }).filter((item) => item.food !== null);
}

export async function batchAddFromParsed(items: ParsedFoodItem[], date: string): Promise<DietLog[]> {
  const results: DietLog[] = [];
  for (const item of items) {
    if (item.food) {
      const log = await addLog(date, item.mealType, item.food, item.weight);
      results.push(log);
    }
  }
  return results;
}
