<template>
  <div class="page-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h3>Model Detail</h3>
          <div>
            <el-button type="primary" @click="handleTest">Test Connection</el-button>
            <el-button @click="handleEdit">Edit</el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="2" border v-if="model">
        <el-descriptions-item label="Model Name">{{ model.name }}</el-descriptions-item>
        <el-descriptions-item label="Vendor">{{ model.vendor }}</el-descriptions-item>
        <el-descriptions-item label="Version">{{ model.version }}</el-descriptions-item>
        <el-descriptions-item label="Interface Type">{{ getInterfaceTypeLabel(model.interfaceType) }}</el-descriptions-item>
        <el-descriptions-item label="Protocol">{{ model.protocol.toUpperCase() }}</el-descriptions-item>
        <el-descriptions-item label="Endpoint">{{ model.endpoint }}</el-descriptions-item>
        <el-descriptions-item label="Port">{{ model.port }}</el-descriptions-item>
        <el-descriptions-item label="Authentication">{{ getAuthTypeLabel(model.authConfig.type) }}</el-descriptions-item>
        <el-descriptions-item label="Supported Languages">{{ model.supportedLanguages.join(', ') }}</el-descriptions-item>
        <el-descriptions-item label="Sampling Rate">{{ model.samplingRate }}Hz</el-descriptions-item>
        <el-descriptions-item label="Created At">{{ formatDate(model.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="Updated At">{{ formatDate(model.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { modelApi } from '@/api/models'
import { ElMessage } from 'element-plus'
import type { Model } from '@/types'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const model = ref<Model | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    model.value = await modelApi.getModel(route.params.id as string)
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
})

async function handleTest() {
  if (!model.value) return
  try {
    const result = await modelApi.testConnection(model.value.id)
    if (result.success) {
      ElMessage.success('Connection test successful')
    } else {
      ElMessage.error(result.message || 'Connection test failed')
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Connection test failed')
  }
}

function handleEdit() {
  router.push(`/models/${route.params.id}/edit`)
}

function getInterfaceTypeLabel(value: string) {
  const map: Record<string, string> = {
    http_api: 'HTTP API',
    grpc: 'gRPC',
    websocket: 'WebSocket'
  }
  return map[value] || value
}

function getAuthTypeLabel(value: string) {
  const map: Record<string, string> = {
    none: 'None',
    api_key: 'API Key',
    token: 'Token',
    username_password: 'Username/Password',
    oauth: 'OAuth'
  }
  return map[value] || value
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
