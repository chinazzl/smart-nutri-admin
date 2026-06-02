<!-- 侧边导航栏 -->
<template>
  <el-menu
    router
    :default-active="$route.path"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
  >
    <div class="logo-box">
      <img src="@/assets/logo.svg" alt="logo" class="logo-img" v-if="!isCollapse" />
      <span class="logo-text" v-if="!isCollapse">智能营养管理</span>
      <el-icon v-else color="#fff" size="22px"><Menu /></el-icon>
    </div>

    <template v-for="item in visibleMenus" :key="item.path">
      <el-menu-item :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </template>
  </el-menu>
  <div class="collapse-btn" @click="toggleCollapse">
    <el-icon v-if="isCollapse" color="#bfcbd9" size="20px"><Expand /></el-icon>
    <el-icon v-else color="#bfcbd9" size="20px"><Fold /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { MENU_CONFIG } from '@/router';
import { useUserStore } from '@/stores/user';

const isCollapse = ref(false);

function getUserRole(): 'admin' | 'user' | null {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    const info = JSON.parse(raw);
    return info.role ?? null;
  } catch {
    return null;
  }
}

const currentRole = ref(getUserRole());

const visibleMenus = computed(() => {
  const role = currentRole.value;
  return MENU_CONFIG.filter((m) => {
    if (!role) return false;
    return m.roles.includes('all') || m.roles.includes(role as any);
  });
});

const emit = defineEmits<{ (e: 'collapse', val: boolean): void }>();

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
  emit('collapse', isCollapse.value);
};

// 监听登录用户变化
watch(
  () => localStorage.getItem('userInfo'),
  () => {
    currentRole.value = getUserRole();
  }
);
</script>

<style scoped lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 210px;
  height: calc(100vh - 50px);
}
.el-menu {
  border-right: none;
  transition: width 0.3s ease;
  overflow: hidden;
}
.logo-box {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2a3f57;
  padding: 0 10px;
  box-sizing: border-box;

  .logo-img {
    height: 28px;
    margin-right: 10px;
    flex-shrink: 0;
  }
  .logo-text {
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.collapse-btn {
  height: 50px;
  background-color: #2a3f57;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-top: 1px solid #374b5e;
  transition: background-color 0.2s;
  &:hover {
    background-color: #304156;
  }
}
</style>
