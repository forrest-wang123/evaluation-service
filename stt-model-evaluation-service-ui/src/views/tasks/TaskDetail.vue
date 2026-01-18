<template>
  <div class="page-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h3>Task Detail</h3>
          <div>
            <el-button
              v-if="task?.status === 'pending'"
              type="primary"
              @click="handleStart"
            >
              Start Execution
            </el-button>
            <el-button
              v-if="task?.status === 'running'"
              type="warning"
              @click="handlePause"
            >
              Pause
            </el-button>
            <el-button
              v-if="task?.status === 'paused'"
              type="success"
              @click="handleResume"
            >
              Resume
            </el-button>
            <el-button
              v-if="['pending', 'running', 'paused'].includes(task?.status || '')"
              type="danger"
              @click="handleCancel"
            >
              Cancel
            </el-button>
            <el-button
              v-if="task?.status === 'completed'"
              type="primary"
              @click="handleViewResults"
            >
              View Results
            </el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="2" border v-if="task">
        <el-descriptions-item label="Task Name">{{ task.name }}</el-descriptions-item>
        <el-descriptions-item label="Status">
          <el-tag :type="getStatusType(task.status)">{{ getStatusLabel(task.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Task Description" :span="2">{{ task.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Progress">
          <el-progress :percentage="task.progress || 0" />
        </el-descriptions-item>
        <el-descriptions-item label="Concurrency">{{ task.executionParams.concurrency }}</el-descriptions-item>
        <el-descriptions-item label="Loop Mode">{{ task.executionParams.loopMode ? 'Yes' : 'No' }}</el-descriptions-item>
        <el-descriptions-item label="Duration">{{ task.executionParams.duration || 'Unlimited' }} seconds</el-descriptions-item>
        <el-descriptions-item label="Created At">{{ formatDate(task.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="Started At">{{ task.startedAt ? formatDate(task.startedAt) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="Completed At">{{ task.completedAt ? formatDate(task.completedAt) : '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-tabs v-if="task" style="margin-top: 20px">
        <el-tab-pane label="Execution Logs">
          <el-table :data="logs" stripe style="width: 100%">
            <el-table-column prop="timestamp" label="Time" width="180">
              <template #default="{ row }">
                {{ formatDate(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="level" label="Level" width="100">
              <template #default="{ row }">
                <el-tag :type="getLogLevelType(row.level)">{{ row.level.toUpperCase() }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="Message" />
          </el-table>
          <el-pagination
            v-model:current-page="logPagination.page"
            v-model:page-size="logPagination.pageSize"
            :total="logTotal"
            layout="prev, pager, next"
            @current-change="loadLogs"
            style="margin-top: 10px"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { taskApi } from '@/api/tasks'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TestTask, TaskExecutionLog } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const task = ref<TestTask | null>(null)
const logs = ref<TaskExecutionLog[]>([])
const logTotal = ref(0)
const logPagination = reactive({ page: 1, pageSize: 50 })
let statusInterval: number | null = null

onMounted(async () => {
  await loadTask()
  await loadLogs()
  // Poll for status updates
  if (task.value && ['running', 'paused'].includes(task.value.status)) {
    statusInterval = window.setInterval(async () => {
      await loadTask()
      await loadLogs()
    }, 3000)
  }
})

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
})

async function loadTask() {
  loading.value = true
  try {
    task.value = await taskApi.getTask(route.params.id as string)
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

async function loadLogs() {
  try {
    const response = await taskApi.getTaskLogs(route.params.id as string, {
      page: logPagination.page,
      pageSize: logPagination.pageSize
    })
    logs.value = response.items
    logTotal.value = response.total
  } catch (error: any) {
    ElMessage.error('Failed to load logs')
  }
}

async function handleStart() {
  try {
    await taskApi.startTask(route.params.id as string)
    ElMessage.success('Task started')
    await loadTask()
  } catch (error: any) {
    ElMessage.error(error.message || 'Operation failed')
  }
}

async function handlePause() {
  try {
    await taskApi.pauseTask(route.params.id as string)
    ElMessage.success('Task paused')
    await loadTask()
  } catch (error: any) {
    ElMessage.error(error.message || 'Operation failed')
  }
}

async function handleResume() {
  try {
    await taskApi.resumeTask(route.params.id as string)
    ElMessage.success('Task resumed')
    await loadTask()
  } catch (error: any) {
    ElMessage.error(error.message || 'Operation failed')
  }
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm('Are you sure you want to cancel this task?', 'Confirm', {
      type: 'warning'
    })
    await taskApi.cancelTask(route.params.id as string)
    ElMessage.success('Task cancelled')
    await loadTask()
  } catch (error) {
    // User cancelled
  }
}

function handleViewResults() {
  router.push(`/tasks/${route.params.id}/results`)
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

function getLogLevelType(value: string) {
  const map: Record<string, string> = {
    info: '',
    warning: 'warning',
    error: 'danger',
    debug: 'info'
  }
  return map[value] || ''
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
  }
}
</style>
