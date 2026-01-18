<template>
  <el-container class="main-layout">
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>STT Model Evaluation System</h2>
        </div>
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          router
          class="header-menu"
        >
          <el-menu-item index="/samples">
            <el-icon><Document /></el-icon>
            <span>Sample Management</span>
          </el-menu-item>
          <el-menu-item index="/models">
            <el-icon><Box /></el-icon>
            <span>Model Management</span>
          </el-menu-item>
          <el-menu-item index="/tasks">
            <el-icon><List /></el-icon>
            <span>Task Management</span>
          </el-menu-item>
          <el-menu-item index="/instant-test">
            <el-icon><VideoPlay /></el-icon>
            <span>Instant Test</span>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><DocumentCopy /></el-icon>
            <span>Evaluation Reports</span>
          </el-menu-item>
          <el-sub-menu index="/system" v-if="userStore.user?.role === 'admin'">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>System Management</span>
            </template>
            <el-menu-item index="/system/users">User Management</el-menu-item>
            <el-menu-item index="/system/config">System Configuration</el-menu-item>
            <el-menu-item index="/system/audit">Audit Logs</el-menu-item>
          </el-sub-menu>
        </el-menu>
        <div class="user-info" v-if="AUTH_CONFIG.ENABLE_AUTH">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-icon><User /></el-icon>
              {{ userStore.user?.username }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">Logout</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="user-info" v-else>
          <span class="user-dropdown">
            <el-icon><User /></el-icon>
            {{ userStore.user?.username || 'Guest' }}
          </span>
        </div>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Document, Box, List, VideoPlay, DocumentCopy, Setting, User, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { AUTH_CONFIG } from '@/config/auth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/samples')) return '/samples'
  if (path.startsWith('/models')) return '/models'
  if (path.startsWith('/tasks')) return '/tasks'
  if (path.startsWith('/reports')) return '/reports'
  if (path.startsWith('/system')) return '/system'
  return path
})

async function handleCommand(command: string) {
  if (command === 'logout') {
    if (!AUTH_CONFIG.ENABLE_AUTH) {
      ElMessage.info('Login feature is currently disabled')
      return
    }
    await userStore.logout()
    ElMessage.success('Logged out successfully')
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: 60px !important;

  .header-content {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 20px;

    .logo {
      margin-right: 40px;
      h2 {
        margin: 0;
        font-size: 20px;
        color: #409eff;
      }
    }

    .header-menu {
      flex: 1;
      border-bottom: none;
    }

    .user-info {
      margin-left: auto;

      .user-dropdown {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #606266;
        font-size: 14px;

        .el-icon {
          margin-right: 5px;
        }
      }
    }
  }
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}
</style>
