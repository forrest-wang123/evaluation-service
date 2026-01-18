<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>Task Results</h3>
          <div>
            <el-button @click="handleExport">Export Results</el-button>
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="results"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="sampleId" label="Sample ID" width="120" />
        <el-table-column prop="modelId" label="Model ID" width="120" />
        <el-table-column prop="rawResult" label="Recognition Result" min-width="200" show-overflow-tooltip />
        <el-table-column label="Accuracy Metrics" width="200">
          <template #default="{ row }">
            <div>WER: {{ (row.metrics.accuracy.wer * 100).toFixed(2) }}%</div>
            <div>CER: {{ (row.metrics.accuracy.cer * 100).toFixed(2) }}%</div>
            <div>SER: {{ (row.metrics.accuracy.ser * 100).toFixed(2) }}%</div>
          </template>
        </el-table-column>
        <el-table-column label="Performance Metrics" width="150">
          <template #default="{ row }">
            <div>Latency: {{ row.metrics.performance.latency }}ms</div>
            <div>Throughput: {{ row.metrics.performance.throughput }}req/s</div>
          </template>
        </el-table-column>
        <el-table-column prop="errorType" label="Error Type" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.errorType" type="danger">{{ getErrorTypeLabel(row.errorType) }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">Detail</el-button>
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

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="Result Detail" width="800px">
      <el-descriptions :column="2" border v-if="currentResult">
        <el-descriptions-item label="Sample ID">{{ currentResult.sampleId }}</el-descriptions-item>
        <el-descriptions-item label="Model ID">{{ currentResult.modelId }}</el-descriptions-item>
        <el-descriptions-item label="Recognition Result" :span="2">
          {{ currentResult.rawResult }}
        </el-descriptions-item>
        <el-descriptions-item label="WER">{{ (currentResult.metrics.accuracy.wer * 100).toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="CER">{{ (currentResult.metrics.accuracy.cer * 100).toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="SER">{{ (currentResult.metrics.accuracy.ser * 100).toFixed(2) }}%</el-descriptions-item>
        <el-descriptions-item label="Latency">{{ currentResult.metrics.performance.latency }}ms</el-descriptions-item>
        <el-descriptions-item label="Throughput">{{ currentResult.metrics.performance.throughput }}req/s</el-descriptions-item>
        <el-descriptions-item label="Error Type">
          <el-tag v-if="currentResult.errorType" type="danger">{{ getErrorTypeLabel(currentResult.errorType) }}</el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { taskApi } from '@/api/tasks'
import { ElMessage } from 'element-plus'
import type { TestResult } from '@/types'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const route = useRoute()
const loading = ref(false)
const results = ref<TestResult[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, pageSize: 20 })
const detailVisible = ref(false)
const currentResult = ref<TestResult | null>(null)

onMounted(() => {
  loadResults()
})

async function loadResults() {
  loading.value = true
  try {
    const response = await taskApi.getTaskResults(route.params.id as string, {
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    results.value = response.items
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function handlePageChange() {
  loadResults()
}

function handleSizeChange() {
  loadResults()
}

function handleViewDetail(row: TestResult) {
  currentResult.value = row
  detailVisible.value = true
}

function handleExport() {
  const data = results.value.map(r => ({
    'Sample ID': r.sampleId,
    'Model ID': r.modelId,
    'Recognition Result': r.rawResult,
    'WER': (r.metrics.accuracy.wer * 100).toFixed(2) + '%',
    'CER': (r.metrics.accuracy.cer * 100).toFixed(2) + '%',
    'SER': (r.metrics.accuracy.ser * 100).toFixed(2) + '%',
    'Latency': r.metrics.performance.latency + 'ms',
    'Throughput': r.metrics.performance.throughput + 'req/s',
    'Error Type': r.errorType ? getErrorTypeLabel(r.errorType) : '-',
    'Created At': formatDate(r.createdAt)
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Results')
  XLSX.writeFile(wb, `task_results_${route.params.id}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`)
  ElMessage.success('Export successful')
}

function getErrorTypeLabel(value: string) {
  const map: Record<string, string> = {
    substitution: 'Substitution',
    insertion: 'Insertion',
    deletion: 'Deletion',
    timeout: 'Timeout',
    api_error: 'API Error',
    format_error: 'Format Error'
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
