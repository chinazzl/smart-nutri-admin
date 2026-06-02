<template>
  <div class="activity-page">
    <!-- 顶部概览 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">运动追踪</h2>
        <el-date-picker
          v-model="currentDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :clearable="false"
          size="small"
          style="width: 160px"
          @change="onDateChange"
        />
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="openAddExercise">手动记运动</el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <div class="stat-card main">
        <div class="card-inner">
          <div class="card-icon burned">
            <el-icon :size="28"><Bicycle /></el-icon>
          </div>
          <div class="card-data">
            <div class="card-value">{{ activityStore.todayBurnedCalories }}</div>
            <div class="card-label">今日消耗 (kcal)</div>
          </div>
          <el-progress
            type="dashboard"
            :percentage="burnedPct"
            :width="70"
            :stroke-width="8"
            color="#f56c6c"
          >
            <template #default>
              <span class="progress-text">{{ activityStore.todayDuration }}min</span>
            </template>
          </el-progress>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon stretch-icon">
          <el-icon :size="22"><Timer /></el-icon>
        </div>
        <div class="card-data">
          <div class="card-value">{{ activityStore.stretchCount }}</div>
          <div class="card-label">拉伸次数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon food-icon">
          <el-icon :size="22"><Dish /></el-icon>
        </div>
        <div class="card-data">
          <div class="card-value">{{ nutritionStore.todayCalories }}</div>
          <div class="card-label">今日摄入 (kcal)</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-icon balance-icon">
          <el-icon :size="22"><Scale /></el-icon>
        </div>
        <div class="card-data">
          <div class="card-value" :class="{ negative: calorieBalance < 0 }">
            {{ calorieBalance > 0 ? '+' : '' }}{{ calorieBalance }}
          </div>
          <div class="card-label">热量差值 (kcal)</div>
        </div>
      </div>
    </div>

    <!-- 双栏布局 -->
    <div class="main-grid">
      <!-- 左侧：今日运动记录 -->
      <div class="record-panel">
        <div class="panel-card">
          <div class="panel-title">
            <el-icon><List /></el-icon>
            今日运动记录
          </div>

          <el-tabs v-model="activeTab">
            <el-tab-pane label="有氧运动" name="exercises">
              <div v-if="activityStore.todayData.exercises.length === 0" class="empty-state">
                <el-icon size="40" color="#dcdfe6"><Bicycle /></el-icon>
                <span>暂无运动记录</span>
                <el-button type="primary" size="small" @click="openAddExercise">开始记录</el-button>
              </div>
              <div v-else class="exercise-list">
                <div
                  v-for="log in activityStore.todayData.exercises"
                  :key="log.id"
                  class="exercise-item"
                >
                  <div class="exercise-info">
                    <div class="exercise-name">{{ log.exercise.name }}</div>
                    <div class="exercise-meta">
                      <el-tag size="small" type="info">{{ log.exercise.category }}</el-tag>
                      <span class="duration">{{ log.duration }} 分钟</span>
                    </div>
                  </div>
                  <div class="exercise-cal">
                    <div class="cal-num">{{ log.calories }}</div>
                    <div class="cal-unit">kcal</div>
                  </div>
                  <el-button
                    :icon="Delete"
                    text
                    type="danger"
                    @click="deleteExercise(log.id)"
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="拉伸打卡" name="stretches">
              <div v-if="activityStore.todayData.stretches.length === 0" class="empty-state">
                <el-icon size="40" color="#dcdfe6"><Timer /></el-icon>
                <span>今日暂无拉伸记录</span>
                <el-button type="success" size="small" @click="scrollToStretch">去拉伸</el-button>
              </div>
              <div v-else class="stretch-list">
                <el-timeline>
                  <el-timeline-item
                    v-for="s in activityStore.todayData.stretches"
                    :key="s.id"
                    color="#67C23A"
                    :timestamp="formatTime(s.completedAt)"
                    placement="top"
                  >
                    <el-card shadow="hover">
                      <div class="stretch-record">
                        <div class="stretch-name">
                          <el-icon color="#67C23A"><CircleCheck /></el-icon>
                          {{ s.name }}
                        </div>
                        <div class="stretch-stats">
                          <el-tag type="success" size="small">{{ s.calories }} kcal</el-tag>
                          <el-tag type="info" size="small">{{ s.duration }}s</el-tag>
                        </div>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 右侧：拉伸模块 -->
      <div class="stretch-panel" ref="stretchPanelRef">
        <div class="panel-card">
          <div class="panel-title">
            <el-icon><Timer /></el-icon>
            久坐克星 · 1分钟办公室拉伸
          </div>
          <div class="stretch-intro">
            每坐1小时，活动5分钟。每日完成3次拉伸，可消耗约45kcal，同时有效缓解颈椎和腰椎疲劳。
          </div>

          <div class="stretch-grid">
            <div
              v-for="stretch in stretches"
              :key="stretch.id"
              class="stretch-card"
              :class="{ done: isStretchDone(stretch.id) }"
              @click="openStretch(stretch)"
            >
              <div class="stretch-icon-wrap">
                <el-icon :size="28"><component :is="stretch.icon" /></el-icon>
              </div>
              <div class="stretch-name">{{ stretch.name }}</div>
              <div class="stretch-meta">
                <el-tag size="small" :type="isStretchDone(stretch.id) ? 'success' : 'info'" effect="dark">
                  {{ stretch.duration }}秒
                </el-tag>
                <span class="stretch-cal">+{{ stretch.calories }}kcal</span>
              </div>
              <div v-if="isStretchDone(stretch.id)" class="done-badge">
                <el-icon><CircleCheck /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加运动弹窗 -->
    <el-dialog v-model="addDialog.visible" title="添加运动记录" width="500px">
      <div class="add-form">
        <div class="form-row">
          <label>运动类型</label>
          <el-select v-model="addDialog.exerciseId" placeholder="请选择运动" size="large" filterable>
            <el-option
              v-for="ex in activityStore.exercises"
              :key="ex.id"
              :label="ex.name"
              :value="ex.id"
            >
              <div class="exercise-option">
                <span>{{ ex.name }}</span>
                <el-tag size="small" type="info">MET {{ ex.met }}</el-tag>
              </div>
            </el-option>
          </el-select>
        </div>
        <div class="form-row">
          <label>运动时长</label>
          <el-input-number
            v-model="addDialog.duration"
            :min="1"
            :max="300"
            :step="5"
            size="large"
          />
          <span class="unit">分钟</span>
        </div>
        <div class="form-row">
          <label>当前体重</label>
          <el-input-number
            v-model="addDialog.weight"
            :min="30"
            :max="200"
            :step="0.5"
            size="large"
          />
          <span class="unit">kg</span>
        </div>
        <div v-if="calcBurned > 0" class="calc-result">
          <el-icon color="#f56c6c"><Bicycle /></el-icon>
          预计消耗 <strong>{{ calcBurned }} kcal</strong>
        </div>
        <div class="formula-tip">
          <el-icon><InfoFilled /></el-icon>
          公式：MET × 体重(kg) × 时间(h)
        </div>
      </div>
      <template #footer>
        <el-button @click="addDialog.visible = false">取消</el-button>
        <el-button type="primary" :disabled="!addDialog.exerciseId" :loading="addDialog.loading" @click="confirmAdd">
          确认添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 拉伸弹窗 -->
    <StretchDialog
      v-model="stretchDialog.visible"
      :stretch="stretchDialog.stretch!"
      @completed="onStretchCompleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  Plus, Bicycle, Timer, Dish, Scale, List, Delete, CircleCheck,
  InfoFilled,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { useUserStore } from '@/stores/user';
import { useActivityStore } from '@/stores/activity';
import { useNutritionStore } from '@/stores/nutrition';
import { BUILTIN_STRETCHES } from '@/types/activity';
import type { StretchItem } from '@/types/activity';
import StretchDialog from '@/components/activity/StretchDialog.vue';

const userStore = useUserStore();
const activityStore = useActivityStore();
const nutritionStore = useNutritionStore();

const stretches = BUILTIN_STRETCHES;
const currentDate = ref(dayjs().format('YYYY-MM-DD'));
const activeTab = ref('exercises');
const stretchPanelRef = ref<HTMLElement | null>(null);

const addDialog = reactive({
  visible: false,
  exerciseId: '',
  duration: 30,
  weight: 70,
  loading: false,
});

const stretchDialog = reactive({
  visible: false,
  stretch: null as StretchItem | null,
});

const calcBurned = computed(() => {
  if (!addDialog.exerciseId) return 0;
  const ex = activityStore.exercises.find((e) => e.id === addDialog.exerciseId);
  if (!ex) return 0;
  return Math.round(ex.met * addDialog.weight * (addDialog.duration / 60));
});

const burnedPct = computed(() => {
  const target = 200;
  return Math.min(100, Math.round((activityStore.todayBurnedCalories / target) * 100));
});

const calorieBalance = computed(() =>
  nutritionStore.todayCalories - activityStore.todayBurnedCalories
);

function isStretchDone(stretchId: string): boolean {
  return activityStore.todayData.stretches.some((s) => s.id === stretchId);
}

function formatTime(iso: string): string {
  return dayjs(iso).format('HH:mm');
}

function openAddExercise() {
  addDialog.exerciseId = '';
  addDialog.duration = 30;
  addDialog.weight = userStore.profile.weight;
  addDialog.visible = true;
}

async function confirmAdd() {
  if (!addDialog.exerciseId) return;
  addDialog.loading = true;
  try {
    await activityStore.addExercise(addDialog.exerciseId, addDialog.duration, addDialog.weight);
    ElMessage.success('运动记录已添加');
    addDialog.visible = false;
  } catch {
    ElMessage.error('添加失败');
  } finally {
    addDialog.loading = false;
  }
}

async function deleteExercise(logId: string) {
  await activityStore.removeExercise(logId);
  ElMessage.success('已删除');
}

function openStretch(stretch: StretchItem) {
  stretchDialog.stretch = stretch;
  stretchDialog.visible = true;
}

async function onStretchCompleted(stretch: StretchItem, calories: number) {
  await activityStore.completeStretch(stretch.id, stretch.name, stretch.duration, calories);
  ElMessage.success(`${stretch.name} 打卡成功！`);
}

function scrollToStretch() {
  stretchPanelRef.value?.scrollIntoView({ behavior: 'smooth' });
}

function onDateChange(date: string) {
  activityStore.setCurrentDate(date);
}

onMounted(async () => {
  addDialog.weight = userStore.profile.weight;
  await userStore.loadProfile();
  await activityStore.loadTodayActivity();
  await nutritionStore.loadTodayLogs();
});
</script>

<style scoped lang="scss">
.activity-page {
  display: flex;
  flex-direction: column;
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
  }
}

.overview-cards {
  display: grid;
  grid-template-columns: 1.5fr repeat(3, 1fr);
  gap: 12px;

  .stat-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    gap: 12px;

    &.main {
      padding: 16px 20px;
      .card-inner {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
      }
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
      &.burned { background: linear-gradient(135deg, #f56c6c, #e6a23c); }
      &.stretch-icon { background: linear-gradient(135deg, #67C23A, #85ce61); }
      &.food-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); }
      &.balance-icon { background: linear-gradient(135deg, #909399, #b1b3b8); }
    }

    .card-data {
      flex: 1;
      .card-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
        line-height: 1;
        &.negative { color: #f56c6c; }
      }
      .card-label {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }

    .progress-text {
      font-size: 13px;
      color: #606266;
      font-weight: 600;
    }
  }
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 16px;
}

.record-panel, .stretch-panel {
  .panel-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

.exercise-list, .stretch-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exercise-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  transition: background 0.15s;
  &:hover { background: #f0f2f5; }
  .exercise-info {
    flex: 1;
    .exercise-name {
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }
    .exercise-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      .duration {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  .exercise-cal {
    text-align: right;
    .cal-num {
      font-size: 20px;
      font-weight: 700;
      color: #f56c6c;
    }
    .cal-unit {
      font-size: 11px;
      color: #909399;
    }
  }
}

.stretch-record {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .stretch-name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: #303133;
  }
  .stretch-stats {
    display: flex;
    gap: 6px;
  }
}

.stretch-intro {
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 16px;
}

.stretch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stretch-card {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 16px 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafbfc;
  &:hover {
    border-color: #67C23A;
    background: #f0f9eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.15);
  }
  &.done {
    border-color: #67C23A;
    background: #f0f9eb;
    .stretch-icon-wrap { background: #67C23A; }
  }
  .stretch-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #e8f4e8;
    color: #67C23A;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
  }
  .stretch-name {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
  }
  .stretch-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    .stretch-cal {
      font-size: 12px;
      color: #67C23A;
      font-weight: 600;
    }
  }
  .done-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    color: #67C23A;
    font-size: 16px;
  }
}

// 添加运动表单
.add-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  .form-row {
    display: flex;
    align-items: center;
    gap: 12px;
    label {
      font-weight: 500;
      min-width: 80px;
      color: #606266;
    }
    .unit {
      color: #909399;
      font-size: 14px;
    }
    .exercise-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
  }
  .calc-result {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef0f0;
    border: 1px solid #fde2e2;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    color: #f56c6c;
    strong { font-size: 18px; }
  }
  .formula-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
