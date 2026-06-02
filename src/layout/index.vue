<!-- 总布局 -->
 <template>
  <el-container class="app-wrapper">
    <el-aside class="sidebar-container" :width="sidebarWidth">
      <Sidebar @collapse="onCollapse" />
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
import { ref, computed } from 'vue';

const isCollapse = ref(false);

const sidebarWidth = computed(() => (isCollapse.value ? '64px' : '210px'));

function onCollapse(val: boolean) {
  isCollapse.value = val;
}
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