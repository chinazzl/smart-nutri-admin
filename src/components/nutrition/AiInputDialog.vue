<template>
  <el-dialog
    v-model="visible"
    title="AI 智能录入"
    width="720px"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <div class="ai-input-container">
      <div class="tips-box">
        <el-icon color="#67C23A"><InfoFilled /></el-icon>
        <span>输入您今天吃了什么，我会智能识别并帮您记录。例如：</span>
        <div class="tip-examples">
          "早饭吃了2个鸡蛋和一杯牛奶"
          "中午吃了一碗红烧肉和米饭"
          "下午茶吃了苹果和一个橙子"
        </div>
      </div>

      <el-input
        v-model="inputText"
        type="textarea"
        :rows="4"
        :placeholder="placeholder"
        resize="none"
        maxlength="500"
        show-word-limit
        @keydown.ctrl.enter="onParse"
        @keydown.meta.enter="onParse"
      />

      <div class="action-row">
        <el-button type="primary" :loading="parsing" @click="onParse">
          <el-icon><MagicStick /></el-icon>
          智能解析
        </el-button>
        <span class="hint">Ctrl+Enter 快捷解析</span>
      </div>

      <!-- 解析结果预览 -->
      <div v-if="parsedItems.length > 0" class="preview-section">
        <el-divider content-position="left">
          <el-icon color="#409EFF"><DocumentChecked /></el-icon>
          解析预览（可微调）
        </el-divider>
        <div class="preview-list">
          <div v-for="(item, idx) in parsedItems" :key="idx" class="preview-item">
            <el-tag :type="mealTagType(item.mealType)" size="small">
              {{ mealLabel(item.mealType) }}
            </el-tag>
            <span class="food-name">{{ item.food?.name ?? '未知' }}</span>
            <div class="weight-edit">
              <el-input-number
                v-model="item.weight"
                :min="10"
                :max="2000"
                size="small"
              />
              <span class="unit">g</span>
            </div>
            <span class="kcal">{{ item.nutrition?.calories ?? '?' }} kcal</span>
            <el-tag v-if="!item.food" type="danger" size="small">未匹配</el-tag>
          </div>
        </div>

        <div class="summary-bar">
          <span>共 {{ validCount }} 条 / 约 {{ totalCalories }} kcal</span>
        </div>
      </div>

      <!-- AI 建议 -->
      <div v-if="aiSuggestion" class="ai-suggestion">
        <el-icon color="#909399"><ChatDotRound /></el-icon>
        <span>{{ aiSuggestion }}</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        :disabled="parsedItems.length === 0 || validCount === 0"
        :loading="submitting"
        @click="onConfirm"
      >
        确认录入 {{ validCount }} 条
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { InfoFilled, MagicStick, DocumentChecked, ChatDotRound } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { MealType, Food, NutritionInfo } from '@/types/nutrition';
import { parseNaturalLanguage } from '@/api/nutrition';

const props = defineProps<{ modelValue: boolean; date: string }>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'added'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const inputText = ref('');
const parsing = ref(false);
const submitting = ref(false);
const aiSuggestion = ref('');

interface ParsedItem {
  food: Food | null;
  weight: number;
  mealType: MealType;
  nutrition: NutritionInfo | null;
}

const parsedItems = ref<ParsedItem[]>([]);

const placeholder = '我今天早上吃了一个鸡蛋和一碗燕麦粥，中午吃了鸡胸肉沙拉...';

const hour = new Date().getHours();
const timeLabel = hour < 10 ? '早餐' : hour < 14 ? '午餐' : hour < 18 ? '下午茶' : '晚餐';

const parsedSuggestions: Record<string, string> = {
  breakfast: '看起来是早餐，建议合理搭配蛋白质和碳水',
  lunch: '午餐建议摄入适量主食和蔬菜',
  dinner: '晚餐建议以清淡为主，控制份量',
  snack: '加餐建议选择低热量高纤维食物',
};

function mealLabel(meal: MealType): string {
  return { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' }[meal];
}

function mealTagType(meal: MealType): string {
  return { breakfast: 'warning', lunch: 'success', dinner: 'danger', snack: 'info' }[meal];
}

const validCount = computed(() => parsedItems.value.filter((i) => i.food).length);
const totalCalories = computed(() =>
  parsedItems.value.reduce((sum, i) => sum + (i.nutrition?.calories ?? 0), 0)
);

async function onParse() {
  if (!inputText.value.trim()) {
    ElMessage.warning('请先输入食物内容');
    return;
  }
  parsing.value = true;
  aiSuggestion.value = '';
  parsedItems.value = [];
  try {
    await new Promise((r) => setTimeout(r, 600));
    const items = parseNaturalLanguage(inputText.value);
    parsedItems.value = items.map((item) => {
      const factor = item.weight / 100;
      const nutrition: NutritionInfo | null = item.food
        ? {
            calories: Math.round(item.food.perHundred.calories * factor),
            protein: Math.round(item.food.perHundred.protein * factor * 10) / 10,
            carbs: Math.round(item.food.perHundred.carbs * factor * 10) / 10,
            fat: Math.round(item.food.perHundred.fat * factor * 10) / 10,
          }
        : null;
      return { food: item.food, weight: item.weight, mealType: item.mealType, nutrition };
    });

    if (items.length === 0) {
      ElMessage.warning('未能识别到食物，请换一种描述方式');
    } else {
      const detected = items[0]?.mealType ?? 'snack';
      aiSuggestion.value = parsedSuggestions[detected] ?? '已识别到食物，请确认份量后确认录入';
      ElMessage.success(`已识别 ${items.length} 条记录`);
    }
  } finally {
    parsing.value = false;
  }
}

async function onConfirm() {
  const valid = parsedItems.value.filter((i) => i.food);
  if (valid.length === 0) {
    ElMessage.warning('没有有效的食物可录入');
    return;
  }
  submitting.value = true;
  try {
    const { useNutritionStore } = await import('@/stores/nutrition');
    const store = useNutritionStore();
    for (const item of valid) {
      if (item.food) {
        await store.addFoodLog(item.food, item.weight, item.mealType);
      }
    }
    ElMessage.success(`已成功录入 ${valid.length} 条饮食记录`);
    emit('added');
    visible.value = false;
  } catch {
    ElMessage.error('录入失败');
  } finally {
    submitting.value = false;
  }
}

function onClosed() {
  inputText.value = '';
  parsedItems.value = [];
  aiSuggestion.value = '';
}
</script>

<style scoped lang="scss">
.ai-input-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tips-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: #606266;
  .tip-examples {
    font-size: 12px;
    color: #909399;
    padding-left: 20px;
    line-height: 1.6;
  }
}
.action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  .hint {
    font-size: 12px;
    color: #909399;
  }
}
.preview-section {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fafafa;
}
.preview-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 260px;
  overflow-y: auto;
}
.preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  .food-name {
    flex: 1;
    font-weight: 500;
    color: #303133;
  }
  .weight-edit {
    display: flex;
    align-items: center;
    gap: 4px;
    .unit {
      font-size: 13px;
      color: #909399;
    }
  }
  .kcal {
    color: #f56c6c;
    font-weight: 600;
    font-size: 13px;
    min-width: 70px;
    text-align: right;
  }
}
.summary-bar {
  margin-top: 10px;
  text-align: right;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}
.ai-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}
</style>
