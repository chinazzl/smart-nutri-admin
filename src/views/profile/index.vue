<template>
  <div
    class="profile-container"
    v-loading="loading"
    element-loading-text="加载健康档案中..."
  >
    <el-row :gutter="20">
      <el-col :span="24" :lg="14">
        <el-card class="input-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="title">👤 身体档案设置</span>
              <el-tag type="info" effect="plain"
                >为了精准推荐，请如实填写</el-tag
              >
            </div>
          </template>

          <el-form :model="userStore.profile" label-position="top" size="large">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-radio-group
                    v-model="userStore.profile.gender"
                    class="gender-select"
                  >
                    <el-radio-button label="male">
                      <el-icon><Male /></el-icon> 男士
                    </el-radio-button>
                    <el-radio-button label="female">
                      <el-icon><Female /></el-icon> 女士
                    </el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年龄 (岁)">
                  <el-input-number
                    v-model="userStore.profile.age"
                    :min="10"
                    :max="100"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20" class="slider-row">
              <el-col :span="12">
                <el-form-item label="身高 (cm)">
                  <div class="slider-input">
                    <el-slider
                      v-model="userStore.profile.height"
                      :min="140"
                      :max="220"
                      vertical
                      height="100px"
                    />
                    <span class="value-text">{{
                      userStore.profile.height
                    }}</span>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="当前体重 (kg)">
                  <div class="slider-input">
                    <el-slider
                      v-model="userStore.profile.weight"
                      :min="40"
                      :max="150"
                      vertical
                      height="100px"
                    />
                    <span class="value-text">{{
                      userStore.profile.weight
                    }}</span>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider />

            <el-form-item label="日常活动强度 (用于计算 TDEE)">
              <el-select
                v-model="userStore.profile.activityLevel"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option label="🛋️ 久坐 (几乎不运动)" :value="1.2" />
                <el-option
                  label="🚶 轻度活动 (每周运动 1-3 次)"
                  :value="1.375"
                />
                <el-option
                  label="🏃 中度活跃 (每周运动 3-5 次)"
                  :value="1.55"
                />
                <el-option
                  label="🏋️ 非常活跃 (每周运动 6-7 次)"
                  :value="1.725"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="你的目标">
              <el-radio-group v-model="userStore.profile.goal" fill="#42b983">
                <el-radio-button label="lose">📉 减脂</el-radio-button>
                <el-radio-button label="maintain">⚖️ 维持</el-radio-button>
                <el-radio-button label="gain">💪 增肌</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-button
              type="primary"
              class="save-btn"
              @click="handleSave"
              :loading="saving"
            >
              保存并在云端同步
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="24" :lg="10">
        <el-card class="result-card target-card" shadow="hover">
          <div class="target-box">
            <span class="label">每日建议摄入</span>
            <div class="number-group">
              <span class="number">{{ userStore.targetCalories }}</span>
              <span class="unit">kcal</span>
            </div>
            <div class="badge" :class="userStore.profile.goal">
              {{ getGoalText(userStore.profile.goal) }}
            </div>
          </div>
        </el-card>

        <el-card class="result-card metrics-panel" shadow="hover">
          <h3 class="panel-title">身体数据分析</h3>

          <div class="metric-item">
            <div class="metric-header">
              <span>BMI 指数</span>
              <span class="metric-value">{{ userStore.bmi }}</span>
            </div>
            <el-progress
              :percentage="calculateBmiPercentage(userStore.bmi)"
              :color="getBmiColor(userStore.bmi)"
              :format="() => getBmiLabel(userStore.bmi)"
              :stroke-width="12"
            />
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-label">基础代谢 (BMR)</span>
              <span class="stat-num">{{ userStore.bmr }}</span>
              <span class="stat-desc">躺着不动的消耗</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">每日总消耗 (TDEE)</span>
              <span class="stat-num">{{ userStore.tdee }}</span>
              <span class="stat-desc">维持当前体重的热量</span>
            </div>
          </div>
        </el-card>

        <el-card class="result-card" shadow="hover">
          <h3 class="panel-title">推荐三大营养素 (Macros)</h3>
          <div class="macros-container">
            <div class="macro-item">
              <el-progress
                type="circle"
                :percentage="50"
                color="#e6a23c"
                :width="80"
              >
                <template #default>
                  <div class="macro-text">
                    <div class="grams">{{ userStore.macros.carbs }}g</div>
                    <div class="name">碳水</div>
                  </div>
                </template>
              </el-progress>
            </div>
            <div class="macro-item">
              <el-progress
                type="circle"
                :percentage="30"
                color="#409eff"
                :width="80"
              >
                <template #default>
                  <div class="macro-text">
                    <div class="grams">{{ userStore.macros.protein }}g</div>
                    <div class="name">蛋白质</div>
                  </div>
                </template>
              </el-progress>
            </div>
            <div class="macro-item">
              <el-progress
                type="circle"
                :percentage="20"
                color="#f56c6c"
                :width="80"
              >
                <template #default>
                  <div class="macro-text">
                    <div class="grams">{{ userStore.macros.fat }}g</div>
                    <div class="name">脂肪</div>
                  </div>
                </template>
              </el-progress>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const saving = ref(false);
const loading = ref(false);

// 组件挂载时加载用户档案
onMounted(async () => {
  if (!userStore.profileLoaded) {
    loading.value = true;
    try {
      await userStore.loadProfile();
    } finally {
      loading.value = false;
    }
  }
});

// 辅助函数：根据 Goal 返回中文
const getGoalText = (goal: string) => {
  const map: Record<string, string> = {
    lose: "热量缺口 -500",
    maintain: "热量平衡",
    gain: "热量盈余 +300",
  };
  return map[goal];
};

// 辅助函数：BMI 进度条计算
const calculateBmiPercentage = (bmi: number) => {
  // 假设 15 是 0%，35 是 100%
  let p = ((bmi - 15) / (35 - 15)) * 100;
  return Math.min(Math.max(p, 0), 100);
};

const getBmiLabel = (bmi: number) => {
  if (bmi < 18.5) return "偏瘦";
  if (bmi < 24) return "正常";
  if (bmi < 28) return "超重";
  return "肥胖";
};

const getBmiColor = (bmi: number) => {
  if (bmi < 18.5) return "#e6a23c"; // 黄
  if (bmi < 24) return "#67c23a"; // 绿
  if (bmi < 28) return "#e6a23c"; // 黄
  return "#f56c6c"; // 红
};

const handleSave = async () => {
  saving.value = true;
  try {
    await userStore.saveProfile(userStore.profile);
  } catch (error) {
    // 错误处理交由 store 或全局拦截器
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.input-card {
  margin-bottom: 20px;
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
  }
}

.slider-row {
  .slider-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f8fcfb;
    padding: 20px 0;
    border-radius: 8px;

    .value-text {
      margin-top: 15px;
      font-weight: bold;
      font-size: 18px;
      color: #42b983;
    }
  }
}

.gender-select {
  width: 100%;
  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 12px 20px;
  }
  :deep(.el-radio-button) {
    flex: 1;
    display: inline-flex;
    width: 50%;
  }
}

.save-btn {
  width: 100%;
  margin-top: 20px;
  font-weight: bold;
  height: 50px;
  font-size: 16px;
}

// 右侧结果卡片样式
.result-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.target-card {
  background: linear-gradient(135deg, #42b983 0%, #2c8a60 100%);
  color: white;
  text-align: center;
  border: none;

  .label {
    font-size: 16px;
    opacity: 0.9;
  }

  .number-group {
    margin: 15px 0;
    .number {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: 2px;
    }
    .unit {
      font-size: 18px;
      margin-left: 5px;
    }
  }

  .badge {
    display: inline-block;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 14px;

    &.lose {
      color: #ffe6e6;
    }
    &.gain {
      color: #e6f7ff;
    }
  }
}

.metrics-panel {
  .panel-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 16px;
    color: #606266;
  }

  .metric-item {
    margin-bottom: 25px;
    .metric-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
      color: #606266;
      .metric-value {
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .stats-grid {
    display: flex;
    gap: 15px;

    .stat-box {
      flex: 1;
      background-color: #f5f7fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;

      .stat-label {
        display: block;
        font-size: 12px;
        color: #909399;
      }
      .stat-num {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        margin: 5px 0;
      }
      .stat-desc {
        display: block;
        font-size: 12px;
        color: #c0c4cc;
        transform: scale(0.9);
      }
    }
  }
}

.macros-container {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;

  .macro-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.2;
    .grams {
      font-weight: bold;
      color: #303133;
      font-size: 16px;
    }
    .name {
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
