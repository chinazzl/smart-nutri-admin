<template>
  <div class="nutrition-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">饮食日记</h2>
        <div class="date-nav">
          <el-button :icon="ArrowLeft" circle size="small" @click="prevMonth" />
          <el-date-picker
            v-model="currentMonth"
            type="month"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            :clearable="false"
            size="small"
            style="width: 140px"
          />
          <el-button :icon="ArrowRight" circle size="small" @click="nextMonth" />
        </div>
        <el-tag type="success" effect="dark" size="large">
          今日 {{ todayLabel }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Search" @click="openFoodSearch">
          手动添加
        </el-button>
        <el-button type="success" :icon="MagicStick" @click="openAiInput">
          AI 快捷录入
        </el-button>
      </div>
    </div>

    <!-- 双栏主体 -->
    <div class="main-grid">
      <!-- 左侧：日历网格 -->
      <div class="calendar-panel">
        <!-- 热量总览 -->
        <div class="overview-cards">
          <div class="stat-card">
            <div class="stat-label">今日摄入</div>
            <div class="stat-value consumed">{{ nutritionStore.todayCalories }}</div>
            <div class="stat-unit">kcal</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">今日目标</div>
            <div class="stat-value">{{ userStore.targetCalories }}</div>
            <div class="stat-unit">kcal</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">剩余热量</div>
            <div class="stat-value remaining" :class="{ negative: remainingCalories < 0 }">
              {{ remainingCalories }}
            </div>
            <div class="stat-unit">kcal</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">营养素</div>
            <div class="macro-bar">
              <div class="macro-item">
                <span class="macro-label">P</span>
                <el-progress :percentage="macroPct('protein')" :stroke-width="6" :show-text="false" color="#409EFF" />
                <span class="macro-val">{{ nutritionStore.todayProtein }}g</span>
              </div>
              <div class="macro-item">
                <span class="macro-label">C</span>
                <el-progress :percentage="macroPct('carbs')" :stroke-width="6" :show-text="false" color="#67C23A" />
                <span class="macro-val">{{ nutritionStore.todayCarbs }}g</span>
              </div>
              <div class="macro-item">
                <span class="macro-label">F</span>
                <el-progress :percentage="macroPct('fat')" :stroke-width="6" :show-text="false" color="#E6A23C" />
                <span class="macro-val">{{ nutritionStore.todayFat }}g</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 日历网格 -->
        <div class="calendar-container">
          <div class="calendar-header">
            <div v-for="d in weekDays" :key="d" class="weekday">{{ d }}</div>
          </div>
          <div class="calendar-grid">
            <div
              v-for="cell in calendarCells"
              :key="cell.key"
              class="calendar-cell"
              :class="{
                'other-month': !cell.currentMonth,
                'is-today': cell.isToday,
                'is-selected': cell.isSelected,
                'is-dragover': cell.isDragover,
              }"
              @click="selectDate(cell)"
              @dragover.prevent="onDragover(cell, $event)"
              @dragenter.prevent="onDragenter(cell)"
              @dragleave="onDragleave(cell)"
              @drop.prevent="onDrop(cell, $event)"
            >
              <span class="cell-date">{{ cell.day }}</span>
              <div v-if="cell.currentMonth && getDaySummary(cell.dateStr)" class="cell-summary">
                <div class="cell-calories">
                  {{ getDaySummary(cell.dateStr)?.totalCalories ?? 0 }} kcal
                </div>
                <div
                  class="cell-bar"
                  :style="{
                    width: getProgressWidth(getDaySummary(cell.dateStr)?.totalCalories ?? 0) + '%',
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：推荐面板 -->
      <div class="recommend-panel">
        <div class="panel-header">
          <el-icon><Sunrise /></el-icon>
          <span>时段推荐</span>
          <el-tag size="small">{{ timePeriodLabel }}</el-tag>
        </div>
        <div class="recommend-foods">
          <div
            v-for="food in recommendedFoods"
            :key="food.id"
            class="food-card"
            draggable="true"
            @dragstart="onDragStart(food, $event)"
            @dragend="onDragEnd"
          >
            <div class="card-inner">
              <div class="card-left">
                <div class="card-name">{{ food.name }}</div>
                <div class="card-meta">
                  <el-tag size="small" type="info">{{ food.category }}</el-tag>
                  <span class="card-cal">{{ food.perHundred.calories }} kcal/100g</span>
                </div>
              </div>
              <div class="card-right">
                <div class="card-default">{{ food.defaultWeight ?? 100 }}g</div>
                <el-tooltip content="拖动到日历添加" placement="left">
                  <el-icon class="drag-hint"><Rank /></el-icon>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>拖动食物卡片到左侧日历日期，快速添加饮食记录</span>
        </div>
      </div>
    </div>

    <!-- 餐次选择 Popover -->
    <el-popover
      :visible="mealPopover.visible"
      :virtual-ref="mealPopover.ref"
      placement="top"
      :width="200"
      virtual-triggering
    >
      <div class="meal-popover">
        <div class="popover-title">添加到</div>
        <div class="meal-buttons">
          <el-button
            v-for="meal in mealOptions"
            :key="meal.value"
            class="meal-btn"
            @click="confirmMeal(meal.value)"
          >
            <el-icon><component :is="meal.icon" /></el-icon>
            {{ meal.label }}
          </el-button>
        </div>
      </div>
    </el-popover>

    <!-- 选中日期详情面板 -->
    <el-drawer
      v-model="dayDrawer.visible"
      :title="`${dayDrawer.date} 饮食详情`"
      size="420px"
      direction="rtl"
    >
      <div class="day-detail">
        <div class="detail-summary">
          <el-statistic title="总热量" :value="dayDetailTotal.calories" suffix="kcal" />
          <div class="detail-bars">
            <div class="detail-bar-item">
              <span>蛋白质</span>
              <el-progress :percentage="macroPctDetail('protein')" :stroke-width="8" color="#409EFF" />
              <span>{{ dayDetailTotal.protein }}g</span>
            </div>
            <div class="detail-bar-item">
              <span>碳水</span>
              <el-progress :percentage="macroPctDetail('carbs')" :stroke-width="8" color="#67C23A" />
              <span>{{ dayDetailTotal.carbs }}g</span>
            </div>
            <div class="detail-bar-item">
              <span>脂肪</span>
              <el-progress :percentage="macroPctDetail('fat')" :stroke-width="8" color="#E6A23C" />
              <span>{{ dayDetailTotal.fat }}g</span>
            </div>
          </div>
        </div>

        <el-tabs v-model="detailMealTab">
          <el-tab-pane label="早餐" name="breakfast" />
          <el-tab-pane label="午餐" name="lunch" />
          <el-tab-pane label="晚餐" name="dinner" />
          <el-tab-pane label="加餐" name="snack" />
        </el-tabs>

        <div class="detail-log-list">
          <div v-if="detailLogs.length === 0" class="empty-meal">
            <el-icon size="32" color="#c0c4cc"><Food /></el-icon>
            <span>暂无记录</span>
          </div>
          <div
            v-for="log in detailLogs"
            :key="log.id"
            class="log-item"
          >
            <div class="log-info">
              <span class="log-name">{{ log.food.name }}</span>
              <span class="log-weight">{{ log.weight }}g</span>
            </div>
            <div class="log-nutrition">
              <span class="log-cal">{{ log.nutrition.calories }} kcal</span>
              <span class="log-macro">
                P {{ log.nutrition.protein }}g / C {{ log.nutrition.carbs }}g / F {{ log.nutrition.fat }}g
              </span>
            </div>
            <div class="log-actions">
              <el-button
                :icon="Edit"
                text
                size="small"
                @click="openEditLog(log)"
              />
              <el-button
                :icon="Delete"
                text
                size="small"
                type="danger"
                @click="deleteLog(log.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 编辑克数弹窗 -->
    <el-dialog v-model="editDialog.visible" title="编辑摄入量" width="400px">
      <div v-if="editDialog.log" class="edit-form">
        <div class="edit-food-name">{{ editDialog.log.food.name }}</div>
        <div class="edit-row">
          <span>摄入量</span>
          <el-input-number v-model="editDialog.newWeight" :min="10" :max="5000" :step="10" size="large" />
          <span>g</span>
        </div>
        <div class="edit-preview">
          <el-tag type="info">热量：<strong>{{ editNewCalories }} kcal</strong></el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 食物搜索弹窗 -->
    <FoodSearchDialog
      v-model="foodSearchVisible"
      :date="selectedDateStr"
      @added="onDataChanged"
    />

    <!-- AI录入弹窗 -->
    <AiInputDialog
      v-model="aiInputVisible"
      :date="selectedDateStr"
      @added="onDataChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue';
import {
  ArrowLeft, ArrowRight, Search, MagicStick, Sunrise, Rank, InfoFilled,
  Edit, Delete, Food,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import { useUserStore } from '@/stores/user';
import { useNutritionStore } from '@/stores/nutrition';
import type { Food as FoodType, DietLog, MealType, MealPeriod, MEAL_PERIODS } from '@/types/nutrition';
import type { VNode } from 'vue';
import FoodSearchDialog from '@/components/nutrition/FoodSearchDialog.vue';
import AiInputDialog from '@/components/nutrition/AiInputDialog.vue';

const userStore = useUserStore();
const nutritionStore = useNutritionStore();

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const currentMonth = ref(dayjs().format('YYYY-MM'));
const selectedDateStr = ref(dayjs().format('YYYY-MM-DD'));
const dragoverCellKey = ref<string | null>(null);

const foodSearchVisible = ref(false);
const aiInputVisible = ref(false);
const detailMealTab = ref<MealType>('breakfast');

// 日历格子数据结构
interface CalendarCell {
  key: string;
  dateStr: string;
  day: number;
  currentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDragover: boolean;
}

const calendarCells = computed<CalendarCell[]>(() => {
  const month = dayjs(currentMonth.value + '-01');
  const startDay = month.startOf('month').day();
  const daysInMonth = month.daysInMonth();
  const today = dayjs().format('YYYY-MM-DD');
  const cells: CalendarCell[] = [];

  // 上月填充
  const prevMonth = month.subtract(1, 'month');
  const prevDays = prevMonth.daysInMonth();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const dateStr = prevMonth.date(d).format('YYYY-MM-DD');
    cells.push({
      key: `prev-${d}`,
      dateStr,
      day: d,
      currentMonth: false,
      isToday: dateStr === today,
      isSelected: dateStr === selectedDateStr.value,
      isDragover: false,
    });
  }

  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = month.date(d).format('YYYY-MM-DD');
    cells.push({
      key: `cur-${d}`,
      dateStr,
      day: d,
      currentMonth: true,
      isToday: dateStr === today,
      isSelected: dateStr === selectedDateStr.value,
      isDragover: false,
    });
  }

  // 下月填充至满6行
  const remaining = 42 - cells.length;
  const nextMonth = month.add(1, 'month');
  for (let d = 1; d <= remaining; d++) {
    const dateStr = nextMonth.date(d).format('YYYY-MM-DD');
    cells.push({
      key: `next-${d}`,
      dateStr,
      day: d,
      currentMonth: false,
      isToday: dateStr === today,
      isSelected: dateStr === selectedDateStr.value,
      isDragover: false,
    });
  }

  return cells;
});

// 更新 isDragover 状态
function onDragover(cell: CalendarCell, _e: DragEvent) {
  cell.isDragover = true;
  dragoverCellKey.value = cell.key;
}
function onDragenter(cell: CalendarCell) {
  const idx = calendarCells.value.findIndex((c) => c.key === cell.key);
  if (idx !== -1) {
    calendarCells.value[idx].isDragover = true;
  }
}
function onDragleave(cell: CalendarCell) {
  const idx = calendarCells.value.findIndex((c) => c.key === cell.key);
  if (idx !== -1) {
    calendarCells.value[idx].isDragover = false;
  }
}

// 拖拽放置
const pendingFood = ref<FoodType | null>(null);
const mealPopover = reactive({
  visible: false,
  ref: null as unknown as VNode,
});

function onDragStart(food: FoodType, e: DragEvent) {
  pendingFood.value = food;
  e.dataTransfer!.setData('text/plain', JSON.stringify(food));
  e.dataTransfer!.effectAllowed = 'copy';
}

function onDragEnd() {
  pendingFood.value = null;
  dragoverCellKey.value = null;
  calendarCells.value.forEach((c) => (c.isDragover = false));
}

function onDrop(cell: CalendarCell, _e: DragEvent) {
  cell.isDragover = false;
  if (!cell.currentMonth) return;

  if (pendingFood.value) {
    selectedDateStr.value = cell.dateStr;
    nutritionStore.setCurrentDate(cell.dateStr);
    // 立即添加到默认餐次
    const defaultMeal = getDefaultMeal();
    addDraggedFood(pendingFood.value, defaultMeal, cell.dateStr);
  }
  pendingFood.value = null;
}

async function addDraggedFood(food: FoodType, mealType: MealType, date: string) {
  const weight = food.defaultWeight ?? 100;
  await nutritionStore.addFoodLog(food, weight, mealType);
  ElMessage.success(`已添加 ${food.name} (${weight}g) 到${mealLabel(mealType)}`);
  nutritionStore.setMonth(
    dayjs(currentMonth.value).year(),
    dayjs(currentMonth.value).month()
  );
}

function getDefaultMeal(): MealType {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 18) return 'snack';
  return 'dinner';
}

function mealLabel(meal: MealType): string {
  return { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }[meal];
}

// 餐次选择
const mealOptions = [
  { value: 'breakfast' as MealType, label: '早餐', icon: 'Sunrise' },
  { value: 'lunch' as MealType, label: '午餐', icon: 'Sunny' },
  { value: 'dinner' as MealType, label: '晚餐', icon: 'Moon' },
  { value: 'snack' as MealType, label: '加餐', icon: 'Bowl' },
];

function confirmMeal(mealType: MealType) {
  if (pendingFood.value) {
    addDraggedFood(pendingFood.value, mealType, selectedDateStr.value);
  }
  mealPopover.visible = false;
  pendingFood.value = null;
}

// 日期选择
function selectDate(cell: CalendarCell) {
  selectedDateStr.value = cell.dateStr;
  nutritionStore.setCurrentDate(cell.dateStr);
  calendarCells.value.forEach((c) => {
    c.isSelected = c.key === cell.key;
  });
  dayDrawer.visible = true;
  dayDrawer.date = cell.dateStr;
}

// 日历数据
function getDaySummary(dateStr: string) {
  return nutritionStore.monthlyLogs.find((d: any) => d.date === dateStr);
}

function getProgressWidth(calories: number): number {
  const target = userStore.targetCalories;
  if (target === 0) return 0;
  return Math.min(100, Math.round((calories / target) * 100));
}

// 营养素百分比
function macroPct(type: 'protein' | 'carbs' | 'fat'): number {
  const targets = userStore.macros;
  const vals = {
    protein: nutritionStore.todayProtein,
    carbs: nutritionStore.todayCarbs,
    fat: nutritionStore.todayFat,
  };
  const target = type === 'protein' ? targets.protein : type === 'carbs' ? targets.carbs : targets.fat;
  if (target === 0) return 0;
  return Math.min(100, Math.round((vals[type] / target) * 100));
}

// 热量计算
const remainingCalories = computed(() =>
  userStore.targetCalories - nutritionStore.todayCalories
);

const todayLabel = computed(() => dayjs().format('MM月DD日'));
const timePeriodLabel = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return '夜间';
  if (h < 9) return '清晨';
  if (h < 12) return '上午';
  if (h < 14) return '中午';
  if (h < 18) return '下午';
  if (h < 22) return '傍晚';
  return '夜间';
});

// 时段推荐食物
const recommendedFoods = computed(() => {
  const h = new Date().getHours();
  // 导入 allFoods
  const { allFoods } = nutritionStore;
  if (h < 10) {
    // 早餐推荐
    return allFoods.filter((f) =>
      ['oatmeal', 'milk', 'egg', 'greek-yogurt', 'whole-wheat-bread', 'yogurt-cup', 'oat-milk-porridge'].includes(f.id)
    );
  } else if (h < 14) {
    // 午餐推荐
    return allFoods.filter((f) =>
      ['chicken-breast', 'brown-rice', 'broccoli', 'fish-steamed', 'salmon', 'tofu', 'veggie-salad'].includes(f.id)
    );
  } else if (h < 18) {
    // 下午茶推荐
    return allFoods.filter((f) =>
      ['apple', 'blueberry', 'mixed-nuts', 'kiwi', 'cottage-cheese', 'yogurt-cup'].includes(f.id)
    );
  } else {
    // 晚餐推荐
    return allFoods.filter((f) =>
      ['fish-steamed', 'chicken-breast', 'broccoli', 'spinach', 'sweet-potato', 'avocado'].includes(f.id)
    );
  }
});

// 月份切换
function prevMonth() {
  const m = dayjs(currentMonth.value).subtract(1, 'month');
  currentMonth.value = m.format('YYYY-MM');
  nutritionStore.setMonth(m.year(), m.month());
}
function nextMonth() {
  const m = dayjs(currentMonth.value).add(1, 'month');
  currentMonth.value = m.format('YYYY-MM');
  nutritionStore.setMonth(m.year(), m.month());
}

// 选中日期详情
const dayDrawer = reactive({
  visible: false,
  date: '',
});

const dayDetailTotal = computed(() => {
  const logs = nutritionStore.todayLogs;
  return {
    calories: logs.reduce((s, l) => s + l.nutrition.calories, 0),
    protein: logs.reduce((s, l) => s + l.nutrition.protein, 0),
    carbs: logs.reduce((s, l) => s + l.nutrition.carbs, 0),
    fat: logs.reduce((s, l) => s + l.nutrition.fat, 0),
  };
});

const detailLogs = computed(() =>
  nutritionStore.logsByMeal[detailMealTab.value] ?? []
);

function macroPctDetail(type: 'protein' | 'carbs' | 'fat'): number {
  const targets = userStore.macros;
  const vals = { protein: dayDetailTotal.value.protein, carbs: dayDetailTotal.value.carbs, fat: dayDetailTotal.value.fat };
  const target = type === 'protein' ? targets.protein : type === 'carbs' ? targets.carbs : targets.fat;
  if (target === 0) return 0;
  return Math.min(100, Math.round((vals[type] / target) * 100));
}

// 编辑与删除
const editDialog = reactive({
  visible: false,
  log: null as DietLog | null,
  newWeight: 100,
});

const editNewCalories = computed(() => {
  if (!editDialog.log) return 0;
  return Math.round(editDialog.log.food.perHundred.calories * (editDialog.newWeight / 100));
});

function openEditLog(log: DietLog) {
  editDialog.log = log;
  editDialog.newWeight = log.weight;
  editDialog.visible = true;
}

async function confirmEdit() {
  if (!editDialog.log) return;
  await nutritionStore.updateFoodLog(editDialog.log.id, editDialog.newWeight);
  ElMessage.success('已更新摄入量');
  editDialog.visible = false;
}

async function deleteLog(logId: string) {
  await ElMessageBox.confirm('确定删除该饮食记录吗？', '提示', { type: 'warning' });
  await nutritionStore.removeFoodLog(logId);
  ElMessage.success('已删除');
}

function openFoodSearch() {
  selectedDateStr.value = dayDrawer.visible ? dayDrawer.date : dayjs().format('YYYY-MM-DD');
  nutritionStore.setCurrentDate(selectedDateStr.value);
  foodSearchVisible.value = true;
}

function openAiInput() {
  selectedDateStr.value = dayDrawer.visible ? dayDrawer.date : dayjs().format('YYYY-MM-DD');
  nutritionStore.setCurrentDate(selectedDateStr.value);
  aiInputVisible.value = true;
}

function onDataChanged() {
  nutritionStore.loadTodayLogs();
  nutritionStore.loadMonthData();
}

// 监听 drawer 日期变化
watch(
  () => dayDrawer.date,
  (newDate) => {
    if (newDate) {
      nutritionStore.setCurrentDate(newDate);
    }
  }
);

onMounted(async () => {
  await userStore.loadProfile();
  await nutritionStore.loadTodayLogs();
  await nutritionStore.loadMonthData();
});
</script>

<style scoped lang="scss">
.nutrition-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #303133;
    }
    .date-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  .header-right {
    display: flex;
    gap: 10px;
  }
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  flex: 1;
  overflow: hidden;
}

// 左侧日历面板
.calendar-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    text-align: center;
    .stat-label {
      font-size: 12px;
      color: #909399;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      line-height: 1;
      &.consumed { color: #409EFF; }
      &.remaining { color: #67C23A; }
      &.negative { color: #f56c6c; }
    }
    .stat-unit {
      font-size: 12px;
      color: #c0c4cc;
      margin-top: 2px;
    }
  }
  .macro-bar {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    .macro-item {
      display: flex;
      align-items: center;
      gap: 6px;
      .macro-label {
        font-size: 11px;
        font-weight: 600;
        width: 12px;
        color: #606266;
      }
      .macro-val {
        font-size: 11px;
        color: #606266;
        min-width: 36px;
        text-align: right;
      }
    }
  }
}

.calendar-container {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
  .weekday {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #909399;
    padding: 6px 0;
    &:first-child, &:last-child {
      color: #f56c6c;
    }
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  flex: 1;
  overflow: hidden;
}

.calendar-cell {
  min-height: 70px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #fafafa;
  &:hover {
    border-color: #409EFF;
    background: #ecf5ff;
  }
  &.other-month {
    opacity: 0.35;
    background: #f5f7fa;
  }
  &.is-today {
    border-color: #409EFF;
    background: #ecf5ff;
    .cell-date {
      background: #409EFF;
      color: #fff;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  &.is-selected {
    border-color: #67C23A;
    background: #f0f9eb;
    box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
  }
  &.is-dragover {
    border: 2px dashed #409EFF;
    background: #ecf5ff;
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  }
  .cell-date {
    font-size: 13px;
    font-weight: 600;
    color: #606266;
  }
  .cell-summary {
    .cell-calories {
      font-size: 11px;
      color: #606266;
      font-weight: 500;
    }
    .cell-bar {
      height: 3px;
      background: linear-gradient(90deg, #409EFF, #67C23A);
      border-radius: 2px;
      margin-top: 2px;
      max-width: 100%;
    }
  }
}

// 右侧推荐面板
.recommend-panel {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 15px;
    color: #303133;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
  }

  .recommend-foods {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    overflow-y: auto;
  }

  .food-card {
    border: 1px solid #ebeef5;
    border-radius: 10px;
    padding: 12px 14px;
    cursor: grab;
    transition: all 0.2s;
    background: linear-gradient(135deg, #f9fafb, #ffffff);
    user-select: none;
    &:hover {
      border-color: #409EFF;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      transform: translateY(-1px);
    }
    &:active {
      cursor: grabbing;
      transform: scale(0.98);
    }
    .card-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      .card-left {
        flex: 1;
        .card-name {
          font-weight: 600;
          font-size: 14px;
          color: #303133;
          margin-bottom: 4px;
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          .card-cal {
            font-size: 11px;
            color: #909399;
          }
        }
      }
      .card-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        .card-default {
          font-size: 12px;
          color: #409EFF;
          font-weight: 600;
        }
        .drag-hint {
          color: #c0c4cc;
          font-size: 14px;
        }
      }
    }
  }

  .panel-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #909399;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
  }
}

// 餐次选择浮层
.meal-popover {
  .popover-title {
    font-size: 13px;
    font-weight: 600;
    color: #606266;
    margin-bottom: 10px;
  }
  .meal-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    .meal-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
      font-size: 13px;
    }
  }
}

// 选中日期详情
.day-detail {
  .detail-summary {
    background: #f9fafb;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 16px;
    .detail-bars {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      .detail-bar-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #606266;
        span:first-child { min-width: 36px; }
        span:last-child { min-width: 40px; text-align: right; }
      }
    }
  }
  .detail-log-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .empty-meal {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 30px 0;
    color: #c0c4cc;
    font-size: 13px;
  }
  .log-item {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 12px;
    background: #fafafa;
    &:hover { background: #f5f7fa; }
    .log-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      .log-name { font-weight: 600; color: #303133; }
      .log-weight { font-size: 12px; color: #909399; }
    }
    .log-nutrition {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      .log-cal { font-size: 13px; font-weight: 600; color: #f56c6c; }
      .log-macro { font-size: 11px; color: #909399; }
    }
    .log-actions {
      display: flex;
      justify-content: flex-end;
      gap: 4px;
    }
  }
}

.edit-form {
  .edit-food-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }
  .edit-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    span { font-weight: 500; }
  }
  .edit-preview { margin-top: 8px; }
}
</style>
