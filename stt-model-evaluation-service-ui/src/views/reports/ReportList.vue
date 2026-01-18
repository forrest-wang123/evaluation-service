<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Evaluation Reports</h2>
    </div>

    <el-card>
      <el-table
        v-loading="loading"
        :data="reports"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="taskName" label="Task Name" width="200" />
        <el-table-column prop="grade" label="Grade" width="100">
          <template #default="{ row }">
            <el-tag :type="getGradeType(row.grade)">{{ row.grade }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="overallScore" label="Overall Score" width="120">
          <template #default="{ row }">
            {{ (row.overallScore * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="version" label="Version" width="100" />
        <el-table-column prop="createdAt" label="Created At" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">View</el-button>
            <el-button link type="primary" @click="handleExportPDF(row)">Export PDF</el-button>
            <el-button link type="primary" @click="handleExportExcel(row)">Export Excel</el-button>
            <el-button link type="primary" @click="handleShare(row)">Share</el-button>
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
import { reportApi } from '@/api/reports'
import { ElMessage } from 'element-plus'
import type { EvaluationReport } from '@/types'
import dayjs from 'dayjs'
import { saveAs } from 'file-saver'

const router = useRouter()
const loading = ref(false)
const reports = ref<EvaluationReport[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, pageSize: 20 })

onMounted(() => {
  loadReports()
})

async function loadReports() {
  loading.value = true
  try {
    const response = await reportApi.getReports({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    reports.value = response.items
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function handlePageChange() {
  loadReports()
}

function handleSizeChange() {
  loadReports()
}

function handleView(row: EvaluationReport) {
  router.push(`/reports/${row.id}`)
}

async function handleExportPDF(row: EvaluationReport) {
  try {
    const blob = await reportApi.exportPDF(row.id)
    saveAs(blob, `report_${row.id}_${dayjs().format('YYYY-MM-DD')}.pdf`)
    ElMessage.success('Export successful')
  } catch (error: any) {
    ElMessage.error(error.message || 'Export failed')
  }
}

async function handleExportExcel(row: EvaluationReport) {
  try {
    const blob = await reportApi.exportExcel(row.id)
    saveAs(blob, `report_${row.id}_${dayjs().format('YYYY-MM-DD')}.xlsx`)
    ElMessage.success('Export successful')
  } catch (error: any) {
    ElMessage.error(error.message || 'Export failed')
  }
}

async function handleShare(row: EvaluationReport) {
  try {
    const result = await reportApi.getShareLink(row.id)
    await navigator.clipboard.writeText(result.link)
    ElMessage.success(`Share link copied to clipboard, valid until ${dayjs(result.expiresAt).format('YYYY-MM-DD HH:mm:ss')}`)
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to get share link')
  }
}

function getGradeType(value: string) {
  const map: Record<string, string> = {
    'A+': 'success',
    'A': 'success',
    'B': 'warning',
    'C': 'warning',
    'D': 'danger'
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
