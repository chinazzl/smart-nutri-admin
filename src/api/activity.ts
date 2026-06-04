/**
 * 运动记录 API（localStorage Mock 实现）
 *
 * TODO: 后端接口实现后，替换为 src/api/activity-real.ts 中的真实 API。
 * 真实 API 调用示例：
 *   import { getActivityByDate, addExercise, deleteExercise, addStretch } from '@/api/activity-real';
 *
 * 切换步骤：
 * 1. 后端实现 /v1/activity/* 接口
 * 2. 修改 src/stores/activity.ts，将 import 从 '@/api/activity' 改为 '@/api/activity-real'
 * 3. 删除本文件
 */
import type { ActivityLog, ActivityData, StretchSession } from '@/types/activity';
import { BUILTIN_EXERCISES, calcCalories } from '@/types/activity';

const STORAGE_KEY = 'smart_nutri_activity';

function getStorage(): ActivityData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStorage(data: ActivityData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function ensureDayEntry(date: string): ActivityData[string] {
  const data = getStorage();
  if (!data[date]) {
    data[date] = {
      date,
      totalDuration: 0,
      totalCalories: 0,
      exercises: [],
      stretches: [],
    };
  }
  return data[date];
}

export { BUILTIN_EXERCISES };

export async function getActivityByDate(date: string): Promise<ActivityData[string]> {
  const data = getStorage();
  return data[date] ?? {
    date,
    totalDuration: 0,
    totalCalories: 0,
    exercises: [],
    stretches: [],
  };
}

export async function addExerciseLog(
  date: string,
  exerciseId: string,
  duration: number,
  weight: number
): Promise<ActivityLog> {
  const exercise = BUILTIN_EXERCISES.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error('Exercise not found');

  const calories = calcCalories(exercise, weight, duration);
  const log: ActivityLog = {
    id: genId(),
    date,
    exercise,
    duration,
    calories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const data = getStorage();
  if (!data[date]) {
    data[date] = { date, totalDuration: 0, totalCalories: 0, exercises: [], stretches: [] };
  }
  data[date].exercises.push(log);
  data[date].totalDuration += duration;
  data[date].totalCalories += calories;
  saveStorage(data);
  return log;
}

export async function deleteExerciseLog(logId: string, date: string): Promise<void> {
  const data = getStorage();
  const day = data[date];
  if (!day) return;
  const idx = day.exercises.findIndex((l: ActivityLog) => l.id === logId);
  if (idx === -1) return;
  const log = day.exercises[idx]!;
  day.totalDuration -= log.duration;
  day.totalCalories -= log.calories;
  day.exercises.splice(idx, 1);
  saveStorage(data);
}

export async function addStretchSession(
  date: string,
  stretchId: string,
  name: string,
  duration: number,
  calories: number
): Promise<StretchSession> {
  const session: StretchSession = {
    id: genId(),
    date,
    name,
    duration,
    calories,
    completedAt: new Date().toISOString(),
  };

  const data = getStorage();
  if (!data[date]) {
    data[date] = { date, totalDuration: 0, totalCalories: 0, exercises: [], stretches: [] };
  }
  data[date].stretches.push(session);
  data[date].totalDuration += Math.round(duration / 60);
  data[date].totalCalories += calories;
  saveStorage(data);
  return session;
}
