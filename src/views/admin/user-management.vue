<template>
  <div class="user-management-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">用户管理</h2>
        <el-tag type="warning" effect="dark">管理员视图</el-tag>
      </div>
      <div class="header-right">
        <el-input
          v-model="keyword"
          placeholder="搜索用户名/账号..."
          :prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-row">
      <el-card shadow="never" class="stat-card">
        <el-statistic title="总用户数" :value="allUsers.length" />
      </el-card>
      <el-card shadow="never" class="stat-card">
        <el-statistic title="活跃用户" :value="activeUsers.length" />
      </el-card>
      <el-card shadow="never" class="stat-card">
        <el-statistic title="管理员" :value="adminCount" />
      </el-card>
      <el-card shadow="never" class="stat-card">
        <el-statistic title="已禁用" :value="disabledCount" />
      </el-card>
    </div>

    <!-- 用户表格 -->
    <div class="table-card">
      <el-table :data="filteredUsers" v-loading="loading" stripe highlight-current-row>
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="user-avatar">
                {{ row.username.slice(0, 1) }}
              </div>
              <div class="user-info">
                <span class="username">{{ row.username }}</span>
                <span class="user-id">ID: {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'" size="small" effect="dark">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="注册时间" width="140">
          <template #default="{ row }">
            <span class="time-text">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="身体档案" width="110" align="center">
          <template #default="{ row }">
            <el-button
              text
              size="small"
              type="primary"
              :icon="View"
              @click="openProfile(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <div class="action-btns">
              <!-- 启用/禁用 -->
              <el-switch
                :model-value="row.status === 'active'"
                active-text="启用"
                inactive-text="禁用"
                inline-prompt
                size="small"
                @change="toggleStatus(row)"
              />
              <!-- 角色切换 -->
              <el-select
                :model-value="row.role"
                size="small"
                style="width: 100px"
                @change="changeRole(row, $event)"
              >
                <el-option label="普通用户" value="user" />
                <el-option label="管理员" value="admin" />
              </el-select>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 身体档案抽屉 -->
    <el-drawer
      v-model="profileDrawer.visible"
      :title="`${profileDrawer.user?.username} 的健康档案`"
      size="440px"
    >
      <div v-if="profileDrawer.user" class="profile-content">
        <!-- 基本信息 -->
        <div class="profile-section">
          <div class="section-title">基本信息</div>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="用户名">{{ profileDrawer.user.username }}</el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag :type="profileDrawer.user.role === 'admin' ? 'danger' : 'primary'" size="small">
                {{ profileDrawer.user.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="profileDrawer.user.status === 'active' ? 'success' : 'info'" size="small">
                {{ profileDrawer.user.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(profileDrawer.user.createdAt) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 身体数据 -->
        <div class="profile-section" v-if="profileDrawer.user.profile">
          <div class="section-title">身体数据</div>
          <div class="health-cards">
            <div class="health-card">
              <div class="hcard-value">{{ profileDrawer.user.profile.gender === 'male' ? '男' : '女' }}</div>
              <div class="hcard-label">性别</div>
            </div>
            <div class="health-card">
              <div class="hcard-value">{{ profileDrawer.user.profile.age }}</div>
              <div class="hcard-label">年龄</div>
            </div>
            <div class="health-card">
              <div class="hcard-value">{{ profileDrawer.user.profile.height }}</div>
              <div class="hcard-label">身高(cm)</div>
            </div>
            <div class="health-card">
              <div class="hcard-value">{{ profileDrawer.user.profile.weight }}</div>
              <div class="hcard-label">体重(kg)</div>
            </div>
          </div>
        </div>

        <!-- 健康指标 -->
        <div class="profile-section" v-if="profileDrawer.user.profile">
          <div class="section-title">健康指标</div>
          <div class="health-cards">
            <div class="health-card accent">
              <div class="hcard-value">{{ profileBmi }}</div>
              <div class="hcard-label">BMI</div>
              <div class="hcard-desc">{{ bmiCategory }}</div>
            </div>
            <div class="health-card">
              <div class="hcard-value">{{ profileBmr }}</div>
              <div class="hcard-label">BMR (kcal)</div>
            </div>
            <div class="health-card">
              <div class="hcard-value">{{ profileTdee }}</div>
              <div class="hcard-label">TDEE (kcal)</div>
            </div>
          </div>
        </div>

        <!-- 目标 -->
        <div class="profile-section" v-if="profileDrawer.user.profile">
          <div class="section-title">健康目标</div>
          <div class="goal-tags">
            <el-tag
              :type="goalTagType(profileDrawer.user.profile.goal)"
              effect="dark"
              size="large"
            >
              {{
                profileDrawer.user.profile.goal === 'lose'
                  ? '减脂'
                  : profileDrawer.user.profile.goal === 'gain'
                  ? '增肌'
                  : '维持体重'
              }}
            </el-tag>
          </div>
        </div>

        <!-- 营养消耗统计 -->
        <div class="profile-section">
          <div class="section-title">本周数据</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="本周摄入">
              {{ weeklyNutrition }} kcal
            </el-descriptions-item>
            <el-descriptions-item label="本周消耗">
              {{ weeklyBurned }} kcal
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Search, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import { getSystemUsers, saveSystemUsers, type SystemUser } from '@/stores/user';

const keyword = ref('');
const loading = ref(false);
const allUsers = ref<SystemUser[]>([]);

const filteredUsers = computed(() => {
  if (!keyword.value) return allUsers.value;
  const kw = keyword.value.toLowerCase();
  return allUsers.value.filter(
    (u) =>
      u.username.toLowerCase().includes(kw) ||
      u.id.toLowerCase().includes(kw)
  );
});

const activeUsers = computed(() => allUsers.value.filter((u) => u.status === 'active'));
const adminCount = computed(() => allUsers.value.filter((u) => u.role === 'admin').length);
const disabledCount = computed(() => allUsers.value.filter((u) => u.status === 'disabled').length);

// 身体档案抽屉
const profileDrawer = reactive({
  visible: false,
  user: null as SystemUser | null,
});

const profileBmi = computed(() => {
  if (!profileDrawer.user?.profile) return '-';
  const { height, weight } = profileDrawer.user.profile;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
});

const bmiCategory = computed(() => {
  const bmi = parseFloat(profileBmi.value);
  if (isNaN(bmi)) return '-';
  if (bmi < 18.5) return '体重过轻';
  if (bmi < 24) return '正常';
  if (bmi < 28) return '超重';
  return '肥胖';
});

const profileBmr = computed(() => {
  if (!profileDrawer.user?.profile) return '-';
  const { gender, weight, height, age } = profileDrawer.user.profile;
  let base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
});

const profileTdee = computed(() => {
  if (!profileDrawer.user?.profile) return '-';
  const bmr = profileBmr.value;
  if (bmr === '-') return '-';
  return Math.round(bmr * profileDrawer.user.profile.activityLevel);
});

// TODO 后端接口：GET /v1/admin/users/:id/weekly-stats，返回本周营养数据后替换以下 mock 值
const weeklyNutrition = ref(0);
const weeklyBurned = ref(0);

function goalTagType(goal: string): string {
  return { lose: 'danger', maintain: 'info', gain: 'success' }[goal] ?? 'info';
}

function formatDate(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DD HH:mm');
}

function openProfile(user: SystemUser) {
  profileDrawer.user = user;
  profileDrawer.visible = true;
}

async function toggleStatus(user: SystemUser) {
  const newStatus = user.status === 'active' ? 'disabled' : 'active';
  const action = newStatus === 'disabled' ? '禁用' : '启用';

  await ElMessageBox.confirm(
    `确定要${action}用户「${user.username}」吗？`,
    '提示',
    { type: 'warning' }
  );

  user.status = newStatus;
  saveSystemUsers(allUsers.value);
  ElMessage.success(`${action}成功`);

  // 如果禁用当前 mock 登录用户，提示
  try {
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (currentUser.id === user.id && newStatus === 'disabled') {
      ElMessage.warning('您禁用了当前登录账号，请使用其他账号登录');
    }
  } catch {}
}

async function changeRole(user: SystemUser, newRole: 'admin' | 'user') {
  user.role = newRole;
  saveSystemUsers(allUsers.value);
  ElMessage.success(`已将「${user.username}」设为${newRole === 'admin' ? '管理员' : '普通用户'}`);
}

function onSearch() {
  // 响应式过滤，无需额外操作
}

function loadUsers() {
  loading.value = true;
  try {
    allUsers.value = getSystemUsers();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<style scoped lang="scss">
.user-management-page {
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
    gap: 12px;
    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #303133;
    }
  }
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  .stat-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
}

.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #409EFF, #66b1ff);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }
  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    .username { font-weight: 600; color: #303133; }
    .user-id { font-size: 11px; color: #c0c4cc; }
  }
}

.action-btns {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.time-text {
  font-size: 13px;
  color: #909399;
}

// 档案抽屉
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409EFF;
    display: inline-block;
  }
}

.health-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .health-card {
    background: #f5f7fa;
    border-radius: 10px;
    padding: 14px;
    text-align: center;
    border: 1px solid #ebeef5;

    &.accent {
      background: linear-gradient(135deg, #ecf5ff, #e8f4e8);
      border-color: #d9ecff;
    }

    .hcard-value {
      font-size: 24px;
      font-weight: 700;
      color: #303133;
      line-height: 1;
    }
    .hcard-label {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
    .hcard-desc {
      font-size: 11px;
      color: #67C23A;
      margin-top: 2px;
    }
  }
}

.goal-tags {
  display: flex;
  gap: 8px;
}
</style>
