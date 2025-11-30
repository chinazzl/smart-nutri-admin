<!-- 总布局 -->
 <template>
  <el-container class="app-wrapper">
    <el-aside class="sidebar-container" :width="sidebarWidth">
      <Sidebar />
    </el-aside>
    
    <el-container class="main-container">
      <el-header class="header-fixed">
        <Header />
      </el-header>
      
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue';
import Header from '../components/Header.vue';
import { computed } from 'vue';

// 简单实现宽度联动（从 Sidebar 中获取 isCollapse 的状态在实际项目中需用 Pinia 或 Emit 共享）
// 为了简化，这里先写死一个宽度，实际项目中需要用 Pinia 状态管理
const sidebarWidth = computed(() => {
    // 默认展开宽度 210px，折叠宽度 64px (Element Plus 默认值)
    // 这里的宽度应与 Sidebar.vue 中的样式 width: 210px 保持一致
    // 理想情况应从 Sidebar 内部获取状态
    return '210px'; 
});
</script>

<style scoped lang="scss">
.app-wrapper {
  height: 100%;
}

.sidebar-container {
  // 宽度已在 Sidebar.vue 中控制，这里只需保证高度充满
  height: 100%; 
  overflow: hidden; // 隐藏滚动条
}

.main-container {
  // 让内容区充满剩余空间
  flex: 1;
  overflow: auto;
}

.header-fixed {
  height: 50px;
  padding: 0;
  background-color: #fff;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,21,41,.08); // 顶部阴影
}

.app-main {
  // 预留顶部 header 的高度
  height: calc(100vh - 50px);
  overflow: auto;
  background-color: #f5f7fa; // 全局背景色
  padding: 20px; // 主内容区内边距
}

// 路由切换动画
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all .3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>