<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Model Management</h2>
      <div>
        <el-button type="primary" @click="$router.push('/models/create')">
          <el-icon><Plus /></el-icon>
          Integrate Model
        </el-button>
        <el-button @click="handleGroupView">
          <el-icon><Grid /></el-icon>
          Model Groups
        </el-button>
      </div>
    </div>

    <el-card>
      <el-table
        v-loading="loading"
        :data="models"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="Model Name" width="200" />
        <el-table-column prop="vendor" label="Vendor" width="150" />
        <el-table-column prop="version" label="Version" width="120" />
        <el-table-column prop="interfaceType" label="Interface Type" width="120">
          <template #default="{ row }">
            {{ getInterfaceTypeLabel(row.interfaceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="endpoint" label="Endpoint" width="200" />
        <el-table-column prop="supportedLanguages" label="Supported Languages" width="150">
          <template #default="{ row }">
            {{ row.supportedLanguages.join(', ') }}
          </template>
        </el-table-column>
        <el-table-column prop="samplingRate" label="Sampling Rate" width="100">
          <template #default="{ row }">
            {{ row.samplingRate }}Hz
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleTest(row)">Test Connection</el-button>
            <el-button link type="primary" @click="handleEdit(row)">Edit</el-button>
            <el-button link type="primary" @click="handleDetail(row)">Detail</el-button>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { modelApi } from '@/api/models'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Grid } from '@element-plus/icons-vue'
import type { Model } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const models = ref<Model[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, pageSize: 20 })

onMounted(() => {
  loadModels()
})

async function loadModels() {
  loading.value = true
  try {
    const response = await modelApi.getModels({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    models.value = response.items
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function handlePageChange() {
  loadModels()
}

function handleSizeChange() {
  loadModels()
}

async function handleTest(row: Model) {
  try {
    const result = await modelApi.testConnection(row.id)
    if (result.success) {
      ElMessage.success('Connection test successful')
    } else {
      ElMessage.error(result.message || 'Connection test failed')
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Connection test failed')
  }
}

function handleEdit(row: Model) {
  router.push(`/models/${row.id}/edit`)
}

function handleDetail(row: Model) {
  router.push(`/models/${row.id}`)
}

async function handleDelete(row: Model) {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this model?', 'Confirm', {
      type: 'warning'
    })
    await modelApi.deleteModel(row.id)
    ElMessage.success('Deleted successfully')
    loadModels()
  } catch (error) {
    // User cancelled
  }
}

function handleGroupView() {
  // TODO: Implement group view
  ElMessage.info('Model grouping feature is under development')
}

function getInterfaceTypeLabel(value: string) {
  const map: Record<string, string> = {
    http_api: 'HTTP API',
    grpc: 'gRPC',
    websocket: 'WebSocket'
  }
  return map[value] || value
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
