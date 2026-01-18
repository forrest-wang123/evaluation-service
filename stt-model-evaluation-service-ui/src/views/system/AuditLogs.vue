<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Audit Logs</h2>
    </div>

    <el-card>
      <el-form :model="filter" inline class="filter-form">
        <el-form-item label="User">
          <el-input v-model="filter.userId" placeholder="Please enter user ID" clearable />
        </el-form-item>
        <el-form-item label="Action">
          <el-input v-model="filter.action" placeholder="Please enter action name" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="logs"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="username" label="Username" width="150" />
        <el-table-column prop="action" label="Action" width="150" />
        <el-table-column prop="resource" label="Resource" width="150" />
        <el-table-column prop="resourceId" label="Resource ID" width="150" />
        <el-table-column prop="details" label="Details" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ JSON.stringify(row.details || {}) }}
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="Time" width="180">
          <template #default="{ row }">
            {{ formatDate(row.timestamp) }}
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
import { ref, reactive, onMounted } from 'vue'
import { systemApi } from '@/api/system'
import { ElMessage } from 'element-plus'
import type { AuditLog } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const logs = ref<AuditLog[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, pageSize: 20 })
const filter = reactive<{ userId?: string; action?: string }>({})

onMounted(() => {
  loadLogs()
})

async function loadLogs() {
  loading.value = true
  try {
    const response = await systemApi.getAuditLogs({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filter
    })
    logs.value = response.items
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadLogs()
}

function handleReset() {
  Object.assign(filter, {})
  handleSearch()
}

function handlePageChange() {
  loadLogs()
}

function handleSizeChange() {
  loadLogs()
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

.filter-form {
  margin-bottom: 20px;
}
</style>
