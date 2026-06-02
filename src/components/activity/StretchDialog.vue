<template>
  <el-dialog
    v-model="visible"
    :title="currentStretch?.name ?? '拉伸跟做'"
    width="500px"
    :close-on-click-modal="false"
    :show-close="!active"
    @closed="onClosed"
  >
    <!-- 拉伸选择阶段 -->
    <div v-if="!active && !completed" class="stretch-select">
      <div class="stretch-desc">
        <el-icon color="#409EFF" size="20"><component :is="currentStretch?.icon ?? 'InfoFilled'" /></el-icon>
        <span>{{ currentStretch?.description }}</span>
      </div>
      <div class="stretch-steps">
        <div v-for="(step, idx) in currentStretch?.steps" :key="idx" class="step-item">
          <div class="step-num">{{ idx + 1 }}</div>
          <div class="step-text">{{ step }}</div>
        </div>
      </div>
    </div>

    <!-- 倒计时阶段 -->
    <div v-if="active" class="countdown-stage">
      <svg class="countdown-ring" viewBox="0 0 200 200">
        <circle class="ring-bg" cx="100" cy="100" r="88" />
        <circle
          class="ring-progress"
          cx="100"
          cy="100"
          r="88"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
        <text x="100" y="100" class="ring-text-main" text-anchor="middle" dominant-baseline="middle">
          {{ displaySeconds }}
        </text>
        <text x="100" y="130" class="ring-text-sub" text-anchor="middle" dominant-baseline="middle">
          秒
        </text>
      </svg>
      <div class="stretch-step-hint">
        <el-icon color="#409EFF"><component :is="currentStretch?.icon ?? 'InfoFilled'" /></el-icon>
        <span>{{ currentStepText }}</span>
      </div>
      <el-progress
        :percentage="totalSteps > 1 ? Math.round(((totalSteps - currentStepIndex - 1) / totalSteps) * 100) : 0"
        :stroke-width="4"
        :show-text="false"
        color="#409EFF"
        style="margin-top: 12px"
      />
    </div>

    <!-- 完成阶段 -->
    <div v-if="completed" class="completed-stage">
      <div class="success-icon">
        <el-icon color="#67C23A" :size="64"><CircleCheckFilled /></el-icon>
      </div>
      <div class="success-title">打卡成功！</div>
      <div class="success-stats">
        <el-tag type="success" size="large" effect="dark">
          {{ currentStretch?.name }}
        </el-tag>
        <el-tag type="warning" size="large" effect="plain">
          消耗 {{ currentStretch?.calories ?? 15 }} kcal
        </el-tag>
      </div>
      <div class="encourage-msg">{{ encouragement }}</div>
    </div>

    <template #footer>
      <template v-if="!active && !completed">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="startStretch">
          <el-icon><VideoPlay /></el-icon>
          开始跟做
        </el-button>
      </template>
      <template v-if="active">
        <el-button type="danger" plain @click="stopStretch">提前结束</el-button>
      </template>
      <template v-if="completed">
        <el-button type="primary" @click="visible = false">完成</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { CircleCheckFilled, VideoPlay } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { StretchItem } from '@/types/activity';

const props = defineProps<{ modelValue: boolean; stretch: StretchItem }>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'completed', stretch: StretchItem, calories: number): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const currentStretch = computed(() => props.stretch);
const totalSeconds = computed(() => currentStretch.value?.duration ?? 60);
const totalSteps = computed(() => currentStretch.value?.steps.length ?? 1);

const active = ref(false);
const completed = ref(false);
const elapsed = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const circumference = 2 * Math.PI * 88;
const dashOffset = computed(() => {
  const progress = elapsed.value / totalSeconds.value;
  return circumference * (1 - progress);
});

const displaySeconds = computed(() => Math.max(0, totalSeconds.value - elapsed.value));

const currentStepIndex = computed(() => {
  const pct = elapsed.value / totalSeconds.value;
  return Math.min(totalSteps.value - 1, Math.floor(pct * totalSteps.value));
});

const currentStepText = computed(() => {
  const steps = currentStretch.value?.steps ?? [];
  return steps[currentStepIndex.value] ?? '';
});

const encouragements = [
  '颈椎解放！已打败全国92%的久坐族 💪',
  '继续保持！良好的拉伸习惯是健康的基石 🏆',
  '太棒了！您已连续坚持多次拉伸打卡 🌟',
  '身体正在感谢您！坚持就是胜利 ✨',
  '研究表明：每日1分钟拉伸可降低34%的腰背疼痛风险 📊',
];

const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

function startStretch() {
  active.value = true;
  elapsed.value = 0;
  timer = setInterval(() => {
    elapsed.value += 1;
    if (elapsed.value >= totalSeconds.value) {
      finishStretch();
    }
  }, 1000);
}

function stopStretch() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  ElMessage.info('拉伸已结束');
  visible.value = false;
}

async function finishStretch() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  active.value = false;
  completed.value = true;

  const calories = currentStretch.value?.calories ?? 15;
  emit('completed', currentStretch.value, calories);
}

function onClosed() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  active.value = false;
  completed.value = false;
  elapsed.value = 0;
}

watch(visible, (v) => {
  if (v) {
    active.value = false;
    completed.value = false;
    elapsed.value = 0;
  }
});
</script>

<style scoped lang="scss">
.stretch-select {
  .stretch-desc {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ecf5ff;
    border: 1px solid #d9ecff;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 13px;
    color: #606266;
    margin-bottom: 16px;
  }
  .stretch-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      .step-num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #409EFF;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .step-text {
        font-size: 13px;
        color: #606266;
        line-height: 1.5;
        padding-top: 2px;
      }
    }
  }
}

.countdown-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.countdown-ring {
  width: 200px;
  height: 200px;
  transform: rotate(-90deg);

  .ring-bg {
    fill: none;
    stroke: #ebeef5;
    stroke-width: 8;
  }
  .ring-progress {
    fill: none;
    stroke: #409EFF;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 1s linear;
  }
  .ring-text-main {
    font-size: 48px;
    font-weight: 700;
    fill: #303133;
    transform: rotate(90deg);
    transform-origin: center;
  }
  .ring-text-sub {
    font-size: 16px;
    fill: #909399;
    transform: rotate(90deg);
    transform-origin: center;
  }
}

.stretch-step-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  color: #606266;
  text-align: center;
  max-width: 400px;
}

.completed-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
  .success-icon {
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .success-title {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
  }
  .success-stats {
    display: flex;
    gap: 10px;
  }
  .encourage-msg {
    font-size: 14px;
    color: #909399;
    text-align: center;
    max-width: 320px;
  }
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
