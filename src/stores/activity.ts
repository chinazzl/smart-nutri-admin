import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ActivityLog, StretchSession, DayActivitySummary } from '@/types/activity';
import {
  getActivityByDate,
  addExerciseLog,
  deleteExerciseLog,
  addStretchSession,
  BUILTIN_EXERCISES,
} from '@/api/activity';

export const useActivityStore = defineStore('activity', () => {
  const currentDate = ref(new Date().toISOString().slice(0, 10));
  const todayData = ref<DayActivitySummary>({
    date: currentDate.value,
    totalDuration: 0,
    totalCalories: 0,
    exercises: [],
    stretches: [],
  });
  const loading = ref(false);

  const todayBurnedCalories = computed(() => todayData.value.totalCalories);
  const todayDuration = computed(() => todayData.value.totalDuration);
  const stretchCount = computed(() => todayData.value.stretches.length);

  async function loadTodayActivity() {
    loading.value = true;
    try {
      todayData.value = await getActivityByDate(currentDate.value);
    } finally {
      loading.value = false;
    }
  }

  function setCurrentDate(date: string) {
    currentDate.value = date;
    loadTodayActivity();
  }

  async function addExercise(exerciseId: string, duration: number, weight: number) {
    const log = await addExerciseLog(currentDate.value, exerciseId, duration, weight);
    await loadTodayActivity();
    return log;
  }

  async function removeExercise(logId: string) {
    await deleteExerciseLog(logId, currentDate.value);
    await loadTodayActivity();
  }

  async function completeStretch(stretchId: string, name: string, duration: number, calories: number) {
    const session = await addStretchSession(currentDate.value, stretchId, name, duration, calories);
    await loadTodayActivity();
    return session;
  }

  return {
    currentDate,
    todayData,
    loading,
    todayBurnedCalories,
    todayDuration,
    stretchCount,
    exercises: BUILTIN_EXERCISES,
    loadTodayActivity,
    setCurrentDate,
    addExercise,
    removeExercise,
    completeStretch,
  };
});
