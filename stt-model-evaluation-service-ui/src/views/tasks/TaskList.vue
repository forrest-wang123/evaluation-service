<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Task Management</h2>
      <el-button type="primary" @click="$router.push('/tasks/create')">
        <el-icon><Plus /></el-icon>
        Create Task
      </el-button>
    </div>

    <el-card>
      <el-table
        v-loading="loading"
        :data="tasks"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="Task Name" width="200" />
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="Progress" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" />
          </template>
        </el-table-column>
        <el-table-column prop="modelSelection.modelIds" label="Test Models" width="200">
          <template #default="{ row }">
            {{ row.modelSelection.modelIds.length }} models
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="startedAt" label="Started At" width="180">
          <template #default="{ row }">
            {{ row.startedAt ? formatDate(row.startedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">Detail</el-button>
            <el-button
              v-if="row.status === 'running'"
              link
              type="warning"
              @click="handlePause(row)"
            >
              Pause
            </el-button>
            <el-button
              v-if="row.status === 'paused'"
              link
              type="success"
              @click="handleResume(row)"
            >
              Resume
            </el-button>
            <el-button
              v-if="['pending', 'running', 'paused'].includes(row.status)"
              link
              type="danger"
              @click="handleCancel(row)"
            >
              Cancel
            </el-button>
            <el-button
              v-if="row.status === 'completed'"
              link
              type="primary"
              @click="handleViewResults(row)"
            >
              View Results
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { taskApi } from '@/api/tasks'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { TestTask } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const tasks = ref<TestTask[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, pageSize: 20 })

let statusInterval: number | null = null

onMounted(() => {
  loadTasks()
  // Poll for status updates
  statusInterval = window.setInterval(() => {
    loadTasks()
  }, 5000)
})

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
})

async function loadTasks() {
  loading.value = true
  try {
    const response = await taskApi.getTasks({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    tasks.value = response.items
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function handlePageChange() {
  loadTasks()
}

function handleSizeChange() {
  loadTasks()
}

function handleDetail(row: TestTask) {
  router.push(`/tasks/${row.id}`)
}

async function handlePause(row: TestTask) {
  try {
    await taskApi.pauseTask(row.id)
    ElMessage.success('Task paused')
    loadTasks()
  } catch (error: any) {
    ElMessage.error(error.message || 'Operation failed')
  }
}

async function handleResume(row: TestTask) {
  try {
    await taskApi.resumeTask(row.id)
    ElMessage.success('Task resumed')
    loadTasks()
  } catch (error: any) {
    ElMessage.error(error.message || 'Operation failed')
  }
}

async function handleCancel(row: TestTask) {
  try {
    await ElMessageBox.confirm('Are you sure you want to cancel this task?', 'Confirm', {
      type: 'warning'
    })
    await taskApi.cancelTask(row.id)
    ElMessage.success('Task cancelled')
    loadTasks()
  } catch (error) {
    // User cancelled
  }
}

function handleViewResults(row: TestTask) {
  router.push(`/tasks/${row.id}/results`)
}

async function handleDelete(row: TestTask) {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this task?', 'Confirm', {
      type: 'warning'
    })
    await taskApi.deleteTask(row.id)
    ElMessage.success('Deleted successfully')
    loadTasks()
  } catch (error) {
    // User cancelled
  }
}

function getStatusLabel(value: string) {
  const map: Record<string, string> = {
    pending: 'Pending',
    running: 'Running',
    paused: 'Paused',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled'
  }
  return map[value] || value
}

function getStatusType(value: string) {
  const map: Record<string, string> = {
    pending: 'info',
    running: 'success',
    paused: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return map[value] || ''
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
  }
}
</style>
