<!-- 侧边导航栏  -->
<template>
  <el-menu
    router
    :default-active="$route.path"
    class="el-menu-vertical-demo"
    :collapse="isCollapse"
    background-color="#304156"
    text-color="#409EFF"
  >
    <div class="logo-box">
      <img
        src="@/assets/logo.svg"
        alt="logo"
        class="logo-img"
        v-if="!isCollapse"
      />
      <span class="logo-text" v-if="!isCollapse">智能营养管理系统</span>
      <el-icon v-else color="#fff" size="24px"><Menu /></el-icon>
    </div>
    <el-menu-item index="/dashboard">
      <el-icon><DataBoard /></el-icon>
      <template #title>仪表盘</template>
    </el-menu-item>
    <el-menu-item index="/ai-consultant">
      <el-icon><ChatDotRound /></el-icon>
      <template #title>AI营养顾问</template>
    </el-menu-item>
    <el-menu-item index="/profile">
      <el-icon><User /></el-icon>
      <template #title>健康档案</template>
    </el-menu-item>
  </el-menu>
  <div class="collapse-btn" @click="toggleCollapse">
    <el-icon v-if="isCollapse" color="#fff" size="24px"><Expand /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isCollapse = ref(false); // 控制侧边栏是否折叠

const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value;
};
</script>

<style scoped lang="scss">
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 210px; // 展开时的宽度
  height: calc(100vh - 50px);
}
.el-menu {
  border-right: none;
  transition: width 0.3s ease;
}
.logo-box {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #36475a;
  padding: 0 10px;
  box-sizing: border-box;
  
  .logo-img {
    height: 30px;
    margin-right: 10px;
  }
  .logo-text {
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    white-space: nowrap;
  }
}
.collapse-btn {
    height: 50px;
    background-color: #304156;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-top: 1px solid #485669;
}
</style>
