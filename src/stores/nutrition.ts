import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Food, DietLog, DayNutritionSummary, MealType, NutritionInfo } from '@/types/nutrition';
import {
  addLog,
  updateLog,
  deleteLog,
  getLogsByDate,
  getMonthlyData,
  searchFoods,
  allFoods,
  batchAddFromParsed,
  parseNaturalLanguage,
} from '@/api/nutrition';

export const useNutritionStore = defineStore('nutrition', () => {
  const currentDate = ref(new Date().toISOString().slice(0, 10));
  const currentYear = ref(new Date().getFullYear());
  const currentMonth = ref(new Date().getMonth());
  const monthlyLogs = ref<any[]>([]);
  const todayLogs = ref<DietLog[]>([]);
  const loading = ref(false);

  const todayCalories = computed(() =>
    todayLogs.value.reduce((sum, log) => sum + log.nutrition.calories, 0)
  );
  const todayProtein = computed(() =>
    todayLogs.value.reduce((sum, log) => sum + log.nutrition.protein, 0)
  );
  const todayCarbs = computed(() =>
    todayLogs.value.reduce((sum, log) => sum + log.nutrition.carbs, 0)
  );
  const todayFat = computed(() =>
    todayLogs.value.reduce((sum, log) => sum + log.nutrition.fat, 0)
  );

  const logsByMeal = computed(() => {
    const map: Record<MealType, DietLog[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    for (const log of todayLogs.value) {
      if (map[log.mealType]) map[log.mealType].push(log);
    }
    return map;
  });

  async function loadTodayLogs() {
    loading.value = true;
    try {
      todayLogs.value = await getLogsByDate(currentDate.value);
    } finally {
      loading.value = false;
    }
  }

  async function loadMonthData() {
    loading.value = true;
    try {
      monthlyLogs.value = await getMonthlyData(currentYear.value, currentMonth.value);
    } finally {
      loading.value = false;
    }
  }

  function setCurrentDate(date: string) {
    currentDate.value = date;
    loadTodayLogs();
  }

  function setMonth(year: number, month: number) {
    currentYear.value = year;
    currentMonth.value = month;
    loadMonthData();
  }

  async function addFoodLog(food: Food, weight: number, mealType: MealType) {
    const log = await addLog(currentDate.value, mealType, food, weight);
    await loadTodayLogs();
    return log;
  }

  async function updateFoodLog(logId: string, weight: number) {
    await updateLog(logId, currentDate.value, weight);
    await loadTodayLogs();
  }

  async function removeFoodLog(logId: string) {
    await deleteLog(logId, currentDate.value);
    await loadTodayLogs();
  }

  async function addFromAiText(text: string) {
    const items = parseNaturalLanguage(text);
    const results = await batchAddFromParsed(items, currentDate.value);
    await loadTodayLogs();
    return results;
  }

  return {
    currentDate,
    currentYear,
    currentMonth,
    monthlyLogs,
    todayLogs,
    loading,
    todayCalories,
    todayProtein,
    todayCarbs,
    todayFat,
    logsByMeal,
    loadTodayLogs,
    loadMonthData,
    setCurrentDate,
    setMonth,
    addFoodLog,
    updateFoodLog,
    removeFoodLog,
    addFromAiText,
    searchFoods,
    allFoods,
  };
});
