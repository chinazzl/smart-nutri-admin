<!-- 顶部信息栏 -->
 <template>
  <div class="header-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ route.meta.title || '仪表盘' }}</el-breadcrumb-item>
    </el-breadcrumb>
    
    <div class="right-menu">
      <el-tooltip effect="dark" content="通知中心" placement="bottom">
        <el-icon class="icon-item"><Bell /></el-icon>
      </el-tooltip>

      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          <el-avatar :size="30" :src="userStore.userInfo?.avatar || 'https://cube.elemecdn.com/0/88/d8e7cbe79b76c0e5a8f4c3c3a44d0webp.webp'" />
          <span class="username">{{ userStore.userInfo?.userName || 'User' }} </span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item icon="User">个人中心</el-dropdown-item>
            <el-dropdown-item icon="Lock">修改密码</el-dropdown-item>
            <el-dropdown-item divided icon="SwitchButton" @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessageBox } from 'element-plus';

const route = useRoute();
const userStore = useUserStore();

const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 使用 store 的 logout 方法
    userStore.logout();
  }).catch(() => {});
};
</script>

<style scoped lang="scss">
.header-container {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .right-menu {
    display: flex;
    align-items: center;
    
    .icon-item {
      margin-right: 20px;
      font-size: 18px;
      cursor: pointer;
    }

    .el-dropdown-link {
      display: flex;
      align-items: center;
      cursor: pointer;
      .username {
          margin-left: 8px;
          margin-right: 5px;
      }
    }
  }
}
</style>