<template>
  <el-dialog
    v-model="visible"
    title="添加食物"
    width="680px"
    :close-on-click-modal="false"
    @closed="onClosed"
  >
    <!-- 搜索区域 -->
    <div class="search-box">
      <el-input
        v-model="keyword"
        placeholder="搜索食物名称..."
        size="large"
        clearable
        :prefix-icon="Search"
        @input="onSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="onSearch" />
        </template>
      </el-input>
    </div>

    <!-- 分类快速筛选 -->
    <div class="category-tabs">
      <el-tag
        v-for="cat in categories"
        :key="cat"
        :type="activeCategory === cat ? 'primary' : 'info'"
        class="category-tag"
        clickable
        @click="toggleCategory(cat)"
      >
        {{ cat }}
      </el-tag>
    </div>

    <!-- 食物列表 -->
    <div class="food-list" v-loading="loading">
      <div
        v-for="food in filteredFoods"
        :key="food.id"
        class="food-item"
        :class="{ selected: selectedFood?.id === food.id }"
        @click="selectFood(food)"
      >
        <div class="food-info">
          <span class="food-name">{{ food.name }}</span>
          <span class="food-category">{{ food.category }}</span>
        </div>
        <div class="food-nutrition">
          <span class="calorie">{{ food.perHundred.calories }} kcal</span>
          <span class="detail">P {{ food.perHundred.protein }}g / C {{ food.perHundred.carbs }}g / F {{ food.perHundred.fat }}g</span>
        </div>
      </div>
      <el-empty v-if="!loading && filteredFoods.length === 0" description="未找到匹配的食物" />
    </div>

    <!-- 份量输入 -->
    <div class="portion-section" v-if="selectedFood">
      <el-divider content-position="left">
        已选择：<strong>{{ selectedFood.name }}</strong>
      </el-divider>
      <div class="portion-row">
        <span class="label">摄入份量</span>
        <el-input-number
          v-model="portionWeight"
          :min="10"
          :max="2000"
          :step="10"
          size="large"
        />
        <span class="unit">g / ml</span>
      </div>
      <div class="calc-preview">
        <el-tag type="info">热量：<strong>{{ calcCalories }} kcal</strong></el-tag>
        <el-tag type="info">蛋白质：<strong>{{ calcProtein }}g</strong></el-tag>
        <el-tag type="info">碳水：<strong>{{ calcCarbs }}g</strong></el-tag>
        <el-tag type="info">脂肪：<strong>{{ calcFat }}g</strong></el-tag>
      </div>
    </div>

    <!-- 餐次选择 -->
    <div class="meal-section" v-if="selectedFood">
      <span class="label">记录到</span>
      <el-radio-group v-model="mealType" size="large">
        <el-radio-button value="breakfast">早餐</el-radio-button>
        <el-radio-button value="lunch">午餐</el-radio-button>
        <el-radio-button value="dinner">晚餐</el-radio-button>
        <el-radio-button value="snack">加餐</el-radio-button>
      </el-radio-group>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        :disabled="!selectedFood"
        :loading="submitting"
        @click="onConfirm"
      >
        确认添加
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { Food, MealType } from '@/types/nutrition';
import { searchFoods } from '@/api/nutrition';

const props = defineProps<{
  modelValue: boolean;
  date: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'added'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const keyword = ref('');
const activeCategory = ref('全部');
const categories = ['全部', '主食', '肉类', '蔬菜', '水果', '奶制品', '坚果', '饮品', '零食', '营养补剂'];

const allFoods = ref<Food[]>([]);
const filteredFoods = ref<Food[]>([]);
const selectedFood = ref<Food | null>(null);
const portionWeight = ref(100);
const mealType = ref<MealType>('breakfast');
const loading = ref(false);
const submitting = ref(false);

function loadFoods() {
  loading.value = true;
  try {
    allFoods.value = searchFoods('');
    filterFoods();
  } finally {
    loading.value = false;
  }
}

function filterFoods() {
  let result = allFoods.value;
  if (keyword.value.trim()) {
    result = searchFoods(keyword.value);
  }
  if (activeCategory.value !== '全部') {
    result = result.filter((f) => f.category === activeCategory.value);
  }
  filteredFoods.value = result.slice(0, 50);
}

function onSearch() {
  filterFoods();
}

function toggleCategory(cat: string) {
  activeCategory.value = cat;
  filterFoods();
}

function selectFood(food: Food) {
  selectedFood.value = food;
  portionWeight.value = food.defaultWeight ?? 100;
}

const calcCalories = computed(() =>
  selectedFood.value ? Math.round(selectedFood.value.perHundred.calories * (portionWeight.value / 100)) : 0
);
const calcProtein = computed(() =>
  selectedFood.value ? (selectedFood.value.perHundred.protein * (portionWeight.value / 100)).toFixed(1) : '0'
);
const calcCarbs = computed(() =>
  selectedFood.value ? (selectedFood.value.perHundred.carbs * (portionWeight.value / 100)).toFixed(1) : '0'
);
const calcFat = computed(() =>
  selectedFood.value ? (selectedFood.value.perHundred.fat * (portionWeight.value / 100)).toFixed(1) : '0'
);

async function onConfirm() {
  if (!selectedFood.value) return;
  submitting.value = true;
  try {
    const { useNutritionStore } = await import('@/stores/nutrition');
    const store = useNutritionStore();
    await store.addFoodLog(selectedFood.value, portionWeight.value, mealType.value);
    ElMessage.success(`已添加 ${selectedFood.value.name} (${portionWeight.value}g)`);
    emit('added');
    visible.value = false;
  } catch (e) {
    ElMessage.error('添加失败');
  } finally {
    submitting.value = false;
  }
}

function onClosed() {
  keyword.value = '';
  activeCategory.value = '全部';
  selectedFood.value = null;
  portionWeight.value = 100;
  mealType.value = 'breakfast';
}

watch(visible, (v) => {
  if (v) loadFoods();
});
</script>

<style scoped lang="scss">
.search-box {
  margin-bottom: 12px;
}
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  .category-tag {
    cursor: pointer;
    &.selected {
      font-weight: bold;
    }
  }
}
.food-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 4px;
}
.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: #f5f7fa;
  }
  &.selected {
    background: #ecf5ff;
    border: 1px solid #409EFF;
  }
  & + .food-item {
    border-top: 1px solid #f0f0f0;
  }
  .food-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    .food-name {
      font-weight: 500;
      color: #303133;
    }
    .food-category {
      font-size: 12px;
      color: #909399;
    }
  }
  .food-nutrition {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    .calorie {
      font-weight: 600;
      color: #f56c6c;
      font-size: 14px;
    }
    .detail {
      font-size: 11px;
      color: #909399;
    }
  }
}
.portion-section {
  margin-top: 16px;
  .portion-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    .label {
      font-weight: 500;
      min-width: 80px;
    }
    .unit {
      color: #909399;
    }
  }
  .calc-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
.meal-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  .label {
    font-weight: 500;
    min-width: 80px;
  }
}
</style>
