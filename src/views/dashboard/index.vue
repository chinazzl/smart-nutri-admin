<template>
  <div class="dashboard-page">
    <!-- 普通用户视图 -->
    <template v-if="isUser">
      <!-- 顶部时段推荐 -->
      <div class="time-period-banner" :class="periodClass">
        <div class="banner-left">
          <div class="banner-time">{{ timeGreeting }}</div>
          <div class="banner-period">{{ periodLabel }}推荐</div>
        </div>
        <div class="banner-foods">
          <div
            v-for="food in periodFoods"
            :key="food.id"
            class="banner-food-chip"
            draggable="true"
            @dragstart="onQuickDrag(food)"
          >
            <span class="chip-name">{{ food.name }}</span>
            <el-tag size="small" type="info">{{ food.defaultWeight ?? 100 }}g</el-tag>
            <span class="chip-cal">{{ food.perHundred.calories }} kcal</span>
          </div>
        </div>
        <div class="banner-actions">
          <el-button type="primary" @click="quickAdd">一键吃它</el-button>
        </div>
      </div>

      <!-- 核心指标卡片 -->
      <div class="core-cards">
        <div class="core-card main-calorie">
          <div class="card-label">今日热量</div>
          <div class="calorie-ring-wrap">
            <el-progress
              type="dashboard"
              :percentage="caloriePct"
              :width="140"
              :stroke-width="12"
              :color="calorieColor"
            >
              <template #default>
                <div class="ring-inner">
                  <div class="ring-consumed">{{ nutritionStore.todayCalories }}</div>
                  <div class="ring-label">已摄入</div>
                </div>
              </template>
            </el-progress>
          </div>
          <div class="calorie-stats">
            <div class="stat-item">
              <span class="stat-val consumed">{{ nutritionStore.todayCalories }}</span>
              <span class="stat-name">已摄入</span>
            </div>
            <div class="stat-divider">−</div>
            <div class="stat-item">
              <span class="stat-val burned">{{ activityStore.todayBurnedCalories }}</span>
              <span class="stat-name">已消耗</span>
            </div>
            <div class="stat-divider">=</div>
            <div class="stat-item">
              <span class="stat-val" :class="{ negative: remainingCalories < 0 }">{{ remainingCalories }}</span>
              <span class="stat-name">剩余</span>
            </div>
          </div>
        </div>

        <div class="core-card macro-card">
          <div class="card-label">营养素</div>
          <div class="macro-charts">
            <div class="macro-ring-wrap">
              <el-progress type="circle" :percentage="macroPct('protein')" :width="90" color="#409EFF">
                <template #default><div class="ring-micro-label">P<br><strong>{{ nutritionStore.todayProtein }}g</strong></div></template>
              </el-progress>
              <div class="macro-target">目标 {{ userStore.macros.protein }}g</div>
            </div>
            <div class="macro-ring-wrap">
              <el-progress type="circle" :percentage="macroPct('carbs')" :width="90" color="#67C23A">
                <template #default><div class="ring-micro-label">C<br><strong>{{ nutritionStore.todayCarbs }}g</strong></div></template>
              </el-progress>
              <div class="macro-target">目标 {{ userStore.macros.carbs }}g</div>
            </div>
            <div class="macro-ring-wrap">
              <el-progress type="circle" :percentage="macroPct('fat')" :width="90" color="#E6A23C">
                <template #default><div class="ring-micro-label">F<br><strong>{{ nutritionStore.todayFat }}g</strong></div></template>
              </el-progress>
              <div class="macro-target">目标 {{ userStore.macros.fat }}g</div>
            </div>
          </div>
        </div>

        <div class="core-card activity-card">
          <div class="card-label">今日运动</div>
          <div class="activity-data">
            <div class="activity-big">
              <span class="act-num">{{ activityStore.todayBurnedCalories }}</span>
              <span class="act-unit">kcal</span>
            </div>
            <div class="activity-meta">
              <span>运动 {{ activityStore.todayDuration }} 分钟</span>
              <span>拉伸 {{ activityStore.stretchCount }} 次</span>
            </div>
            <el-progress :percentage="Math.min(100, (activityStore.todayBurnedCalories / 200) * 100)" :stroke-width="8" color="#f56c6c" />
          </div>
        </div>
      </div>

      <!-- 底部快捷操作 -->
      <div class="quick-actions">
        <div class="action-card water" @click="onWater">
          <div class="action-icon">
            <el-icon :size="28"><CoffeeCup /></el-icon>
          </div>
          <div class="action-label">喝水打卡</div>
          <div class="action-sub">{{ waterCount }} / 8 杯</div>
          <el-progress :percentage="(waterCount / 8) * 100" :stroke-width="6" :show-text="false" color="#409EFF" style="margin-top: 8px" />
        </div>

        <div class="action-card stretch" @click="onQuickStretch">
          <div class="action-icon">
            <el-icon :size="28"><Timer /></el-icon>
          </div>
          <div class="action-label">快速拉伸</div>
          <div class="action-sub">{{ activityStore.stretchCount > 0 ? '今日已完成' : '点击开始' }}</div>
        </div>

        <div class="action-card ai" @click="$router.push('/ai-assistant')">
          <div class="action-icon">
            <el-icon :size="28"><ChatDotRound /></el-icon>
          </div>
          <div class="action-label">AI 营养师</div>
          <div class="action-sub">智能分析建议</div>
        </div>

        <div class="action-card nutrition" @click="$router.push('/nutrition')">
          <div class="action-icon">
            <el-icon :size="28"><Dish /></el-icon>
          </div>
          <div class="action-label">饮食日记</div>
          <div class="action-sub">记录今日饮食</div>
        </div>
      </div>
    </template>

    <!-- 管理员视图 -->
    <template v-else>
      <!-- 管理概览 -->
      <div class="admin-banner">
        <div class="banner-greeting">
          <div class="greeting-main">运营管理仪表盘</div>
          <div class="greeting-sub">实时监控平台健康状态</div>
        </div>
        <div class="admin-stats">
          <div class="admin-stat">
            <div class="stat-val">{{ systemStats.dau }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="admin-stat">
            <div class="stat-val">{{ systemStats.aiCalls }}</div>
            <div class="stat-label">AI 提问次数</div>
          </div>
          <div class="admin-stat">
            <div class="stat-val">{{ systemStats.stretchRate }}%</div>
            <div class="stat-label">拉伸完成率</div>
          </div>
          <div class="admin-stat">
            <div class="stat-val">{{ systemStats.totalUsers }}</div>
            <div class="stat-label">注册用户</div>
          </div>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="charts-grid">
        <div class="chart-card wide">
          <div class="chart-title">
            <el-icon><TrendCharts /></el-icon>
            用户注册趋势（近7天）
          </div>
          <div ref="userChartRef" class="chart-container" />
        </div>

        <div class="chart-card">
          <div class="chart-title">
            <el-icon><DataLine /></el-icon>
            功能使用分布
          </div>
          <div ref="pieChartRef" class="chart-container square" />
        </div>

        <div class="chart-card">
          <div class="chart-title">
            <el-icon><Odometer /></el-icon>
            服务器状态
          </div>
          <div class="server-status">
            <div class="server-item">
              <el-tag type="success" effect="dark" size="small">正常</el-tag>
              <span>API 服务</span>
              <span class="server-latency">12ms</span>
            </div>
            <div class="server-item">
              <el-tag type="success" effect="dark" size="small">正常</el-tag>
              <span>数据库</span>
              <span class="server-latency">8ms</span>
            </div>
            <div class="server-item">
              <el-tag type="success" effect="dark" size="small">正常</el-tag>
              <span>AI 模型</span>
              <span class="server-latency">156ms</span>
            </div>
            <div class="server-item">
              <el-tag type="success" effect="dark" size="small">正常</el-tag>
              <span>存储服务</span>
              <span class="server-latency">5ms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近活跃用户 -->
      <div class="recent-users-card">
        <div class="card-title">
          <el-icon><User /></el-icon>
          今日活跃用户
        </div>
        <el-table :data="recentUsers" size="small" stripe>
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="action" label="最近操作" />
          <el-table-column prop="time" label="时间" />
          <el-table-column label="热量摄入">
            <template #default="{ row }">
              <el-tag size="small" type="info">{{ row.calories }} kcal</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- 拉伸弹窗 -->
    <StretchDialog
      v-model="stretchDialog.visible"
      :stretch="stretchDialog.stretch!"
      @completed="onStretchCompleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import {
  CoffeeCup, Timer, ChatDotRound, Dish,
  TrendCharts, DataLine, Odometer, User,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { useUserStore } from '@/stores/user';
import { useNutritionStore } from '@/stores/nutrition';
import { useActivityStore } from '@/stores/activity';
import type { Food } from '@/types/nutrition';
import { BUILTIN_STRETCHES } from '@/types/activity';
import StretchDialog from '@/components/activity/StretchDialog.vue';

const userStore = useUserStore();
const nutritionStore = useNutritionStore();
const activityStore = useActivityStore();

// 角色判断
const isUser = computed(() => {
  const info = userStore.userInfo;
  return !info || info.role !== 'admin';
});

// 热量相关
const remainingCalories = computed(() =>
  userStore.targetCalories - nutritionStore.todayCalories + activityStore.todayBurnedCalories
);
const caloriePct = computed(() =>
  Math.min(100, Math.round((nutritionStore.todayCalories / userStore.targetCalories) * 100))
);
const calorieColor = computed(() => {
  const pct = caloriePct.value;
  if (pct > 100) return '#f56c6c';
  if (pct > 85) return '#e6a23c';
  return '#67C23A';
});

function macroPct(type: 'protein' | 'carbs' | 'fat'): number {
  const targets = userStore.macros;
  const vals = { protein: nutritionStore.todayProtein, carbs: nutritionStore.todayCarbs, fat: nutritionStore.todayFat };
  const target = type === 'protein' ? targets.protein : type === 'carbs' ? targets.carbs : targets.fat;
  if (!target) return 0;
  return Math.min(100, Math.round((vals[type] / target) * 100));
}

// 时段相关
const currentHour = new Date().getHours();

const periodLabel = computed(() => {
  if (currentHour < 6) return '夜间';
  if (currentHour < 9) return '清晨';
  if (currentHour < 12) return '上午';
  if (currentHour < 14) return '中午';
  if (currentHour < 18) return '下午';
  if (currentHour < 22) return '傍晚';
  return '夜间';
});

const periodClass = computed(() => {
  if (currentHour < 6 || currentHour >= 22) return 'period-night';
  if (currentHour < 12) return 'period-morning';
  if (currentHour < 14) return 'period-noon';
  if (currentHour < 18) return 'period-afternoon';
  return 'period-evening';
});

const timeGreeting = computed(() => {
  if (currentHour < 6) return '深夜好';
  if (currentHour < 9) return '早安';
  if (currentHour < 12) return '上午好';
  if (currentHour < 14) return '中午好';
  if (currentHour < 18) return '下午好';
  if (currentHour < 22) return '傍晚好';
  return '夜深了';
});

const periodFoods = computed(() => {
  const all = nutritionStore.allFoods;
  if (currentHour < 10) {
    return all.filter((f) => ['oatmeal', 'milk', 'egg', 'greek-yogurt', 'whole-wheat-bread'].includes(f.id));
  } else if (currentHour < 14) {
    return all.filter((f) => ['chicken-breast', 'brown-rice', 'broccoli', 'fish-steamed'].includes(f.id));
  } else if (currentHour < 18) {
    return all.filter((f) => ['apple', 'blueberry', 'mixed-nuts', 'cottage-cheese'].includes(f.id));
  } else {
    return all.filter((f) => ['fish-steamed', 'broccoli', 'spinach', 'avocado'].includes(f.id));
  }
});

const waterCount = ref(parseInt(localStorage.getItem('water_count') || '0'));

function onWater() {
  if (waterCount.value >= 8) {
    ElMessage.info('今日喝水目标已完成');
    return;
  }
  waterCount.value++;
  localStorage.setItem('water_count', String(waterCount.value));
  ElMessage.success(`喝水打卡 +1（${waterCount.value}/8）`);
}

// 拉伸弹窗
const stretchDialog = reactive({
  visible: false,
  stretch: BUILTIN_STRETCHES[0],
});

function onQuickStretch() {
  stretchDialog.stretch = BUILTIN_STRETCHES[0];
  stretchDialog.visible = true;
}

async function onStretchCompleted() {
  ElMessage.success('拉伸打卡成功');
}

// 一键添加
function onQuickDrag(food: Food) {
  const weight = food.defaultWeight ?? 100;
  nutritionStore.addFoodLog(food, weight, currentHour < 10 ? 'breakfast' : currentHour < 14 ? 'lunch' : currentHour < 18 ? 'snack' : 'dinner');
  ElMessage.success(`已添加 ${food.name}`);
}

async function quickAdd() {
  if (periodFoods.value.length > 0) {
    const food = periodFoods.value[0];
    await onQuickDrag(food);
  }
}

// ECharts 图表
const userChartRef = ref<HTMLElement>();
const pieChartRef = ref<HTMLElement>();
let userChart: ECharts | null = null;
let pieChart: ECharts | null = null;

function getUserRole(): 'admin' | 'user' {
  const raw = localStorage.getItem('userInfo');
  if (!raw) return 'user';
  try {
    const info = JSON.parse(raw);
    return info.role ?? 'user';
  } catch {
    return 'user';
  }
}

// TODO 后端接口：GET /v1/admin/stats，后端返回真实统计数据后替换以下 mock 数据
const systemStats = reactive({
  dau: 128,
  aiCalls: 342,
  stretchRate: 68,
  totalUsers: 256,
});

// TODO 后端接口：GET /v1/admin/recent-users，后端返回真实活跃用户列表后替换以下 mock 数据
const recentUsers = ref([
  { username: '张三', action: '完成拉伸打卡', time: '10:32', calories: 1890 },
  { username: '李四', action: '添加饮食记录', time: '10:15', calories: 1450 },
  { username: '王五', action: 'AI 营养咨询', time: '09:48', calories: 2100 },
  { username: '赵六', action: '记录运动', time: '09:30', calories: 1680 },
  { username: '钱七', action: '更新健康档案', time: '09:12', calories: 1320 },
]);

function initCharts() {
  const role = getUserRole();
  if (role !== 'admin') return;

  nextTick(() => {
    if (userChartRef.value) {
      userChart = echarts.init(userChartRef.value);
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
// TODO 后端接口：GET /v1/admin/user-registrations?days=7，后端返回近7天注册数据后替换以下 mock 数组
      const registrations = [28, 35, 42, 31, 45, 38, 52];

      userChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
        xAxis: { type: 'category', data: days, boundaryGap: false, axisLine: { lineStyle: { color: '#e4e7ed' } }, axisLabel: { color: '#606266' } },
        yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: '#606266' } },
        series: [{
          data: registrations,
          type: 'line',
          smooth: true,
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(64,158,255,0.3)' }, { offset: 1, color: 'rgba(64,158,255,0.05)' }] } },
          lineStyle: { color: '#409EFF', width: 3 },
          itemStyle: { color: '#409EFF' },
        }],
      });
    }

    if (pieChartRef.value) {
      pieChart = echarts.init(pieChartRef.value);
      pieChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        legend: { bottom: '0', left: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
// TODO 后端接口：GET /v1/admin/feature-usage，后端返回真实使用分布数据后替换以下 mock 数据
          data: [
            { value: 335, name: '饮食记录', itemStyle: { color: '#409EFF' } },
            { value: 234, name: '运动打卡', itemStyle: { color: '#67C23A' } },
            { value: 154, name: 'AI 咨询', itemStyle: { color: '#E6A23C' } },
            { value: 98, name: '健康档案', itemStyle: { color: '#909399' } },
          ],
        }],
      });
    }
  });
}

function handleResize() {
  userChart?.resize();
  pieChart?.resize();
}

onMounted(async () => {
  await userStore.loadProfile();
  await nutritionStore.loadTodayLogs();
  await activityStore.loadTodayActivity();
  initCharts();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  userChart?.dispose();
  pieChart?.dispose();
});
</script>

<style scoped lang="scss">
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

// ===== 普通用户视图 =====

// 时段横幅
.time-period-banner {
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, #ecf5ff, #f0f9eb);
  border: 1px solid #d9ecff;
  transition: all 0.3s;

  &.period-morning { background: linear-gradient(135deg, #fef0e6, #fff7e6); border-color: #ffe7ba; }
  &.period-noon { background: linear-gradient(135deg, #fff2e6, #fff0e6); border-color: #ffd9b3; }
  &.period-afternoon { background: linear-gradient(135deg, #ecf5ff, #f0f9eb); border-color: #d9ecff; }
  &.period-evening { background: linear-gradient(135deg, #f0f0f5, #e8e8f5); border-color: #d9d9e6; }
  &.period-night { background: linear-gradient(135deg, #2a3f57, #1a2a3f); border-color: #3a5070; color: #fff; }

  .banner-left {
    flex-shrink: 0;
    .banner-time {
      font-size: 14px;
      color: #909399;
    }
    .banner-period {
      font-size: 20px;
      font-weight: 700;
      color: #303133;
    }
  }

  .banner-foods {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;

    .banner-food-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 20px;
      padding: 5px 12px;
      font-size: 13px;
      cursor: grab;
      transition: all 0.2s;
      &:hover {
        border-color: #409EFF;
        box-shadow: 0 2px 8px rgba(64,158,255,0.15);
        transform: translateY(-1px);
      }
      .chip-name { font-weight: 500; }
      .chip-cal { color: #f56c6c; font-weight: 600; }
    }
  }

  .banner-actions {
    flex-shrink: 0;
  }
}

// 核心卡片
.core-cards {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 12px;
}

.core-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .card-label {
    font-size: 13px;
    font-weight: 600;
    color: #909399;
    margin-bottom: 12px;
  }
}

.main-calorie {
  .calorie-ring-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
    .ring-inner {
      text-align: center;
      .ring-consumed {
        font-size: 28px;
        font-weight: 700;
        color: #409EFF;
        line-height: 1;
      }
      .ring-label {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  .calorie-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    .stat-item {
      text-align: center;
      .stat-val {
        font-size: 20px;
        font-weight: 700;
        color: #303133;
        &.consumed { color: #409EFF; }
        &.burned { color: #f56c6c; }
        &.negative { color: #f56c6c; }
      }
      .stat-name {
        font-size: 12px;
        color: #909399;
        display: block;
      }
    }
    .stat-divider {
      font-size: 20px;
      color: #dcdfe6;
    }
  }
}

.macro-card {
  .macro-charts {
    display: flex;
    justify-content: space-around;
    align-items: center;
    .macro-ring-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      .ring-micro-label {
        font-size: 12px;
        color: #606266;
        text-align: center;
        line-height: 1.2;
      }
      .macro-target {
        font-size: 10px;
        color: #c0c4cc;
      }
    }
  }
}

.activity-card {
  .activity-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    .activity-big {
      .act-num {
        font-size: 36px;
        font-weight: 700;
        color: #f56c6c;
      }
      .act-unit {
        font-size: 14px;
        color: #909399;
      }
    }
    .activity-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #909399;
    }
  }
}

// 快捷操作
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  text-align: center;

  &.water:hover { background: linear-gradient(135deg, #ecf5ff, #f0f9eb); }
  &.stretch:hover { background: linear-gradient(135deg, #f0f9eb, #ecf5ff); }
  &.ai:hover { background: linear-gradient(135deg, #f0f0f5, #ecf5ff); }
  &.nutrition:hover { background: linear-gradient(135deg, #fff2e6, #ecf5ff); }

  &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  .action-label {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
  .action-sub {
    font-size: 12px;
    color: #909399;
  }
}

.water .action-icon { background: linear-gradient(135deg, #409EFF, #66b1ff); color: #fff; }
.stretch .action-icon { background: linear-gradient(135deg, #67C23A, #85ce61); color: #fff; }
.ai .action-icon { background: linear-gradient(135deg, #E6A23C, #f0b560); color: #fff; }
.nutrition .action-icon { background: linear-gradient(135deg, #f56c6c, #ff8c8c); color: #fff; }

// ===== 管理员视图 =====

.admin-banner {
  background: linear-gradient(135deg, #2a3f57, #36475a);
  border-radius: 16px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;

  .banner-greeting {
    .greeting-main {
      font-size: 22px;
      font-weight: 700;
    }
    .greeting-sub {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 4px;
    }
  }

  .admin-stats {
    display: flex;
    gap: 32px;
    .admin-stat {
      text-align: center;
      .stat-val {
        font-size: 28px;
        font-weight: 700;
        color: #fff;
      }
      .stat-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 2px;
      }
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  &.wide { grid-column: span 1; }

  .chart-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }
}

.chart-container {
  height: 200px;
  &.square { height: 200px; }
}

.server-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .server-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #606266;
    .server-latency {
      margin-left: auto;
      font-weight: 600;
      color: #67C23A;
    }
  }
}

.recent-users-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  .card-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }
}
</style>
