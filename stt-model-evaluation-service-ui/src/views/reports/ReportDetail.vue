<template>
  <div class="page-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h3>Evaluation Report Detail</h3>
          <div>
            <el-button @click="handleExportPDF">Export PDF</el-button>
            <el-button @click="handleExportExcel">Export Excel</el-button>
            <el-button @click="handleShare">Share</el-button>
          </div>
        </div>
      </template>
      <div v-if="report">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Task Name">{{ report.taskName }}</el-descriptions-item>
          <el-descriptions-item label="Grade">
            <el-tag :type="getGradeType(report.grade)" size="large">{{ report.grade }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Overall Score">
            <span style="font-size: 24px; font-weight: bold">{{ (report.overallScore * 100).toFixed(2) }}%</span>
          </el-descriptions-item>
          <el-descriptions-item label="Version">v{{ report.version }}</el-descriptions-item>
          <el-descriptions-item label="Created At">{{ formatDate(report.createdAt) }}</el-descriptions-item>
        </el-descriptions>

        <el-card style="margin-top: 20px">
          <template #header>
            <h4>Strengths Analysis</h4>
          </template>
          <ul>
            <li v-for="(strength, index) in report.strengths" :key="index">{{ strength }}</li>
          </ul>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header>
            <h4>Weaknesses Analysis</h4>
          </template>
          <ul>
            <li v-for="(weakness, index) in report.weaknesses" :key="index">{{ weakness }}</li>
          </ul>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header>
            <h4>Improvement Suggestions</h4>
          </template>
          <ul>
            <li v-for="(suggestion, index) in report.suggestions" :key="index">{{ suggestion }}</li>
          </ul>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header>
            <h4>Detailed Metrics</h4>
          </template>
          <el-tabs>
            <el-tab-pane label="Accuracy Metrics">
              <div ref="accuracyChart" style="width: 100%; height: 400px"></div>
            </el-tab-pane>
            <el-tab-pane label="Performance Metrics">
              <div ref="performanceChart" style="width: 100%; height: 400px"></div>
            </el-tab-pane>
            <el-tab-pane label="Robustness Metrics">
              <div ref="robustnessChart" style="width: 100%; height: 400px"></div>
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header>
            <h4>Error Distribution</h4>
          </template>
          <div ref="errorChart" style="width: 100%; height: 400px"></div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { reportApi } from '@/api/reports'
import { ElMessage } from 'element-plus'
import type { EvaluationReport } from '@/types'
import dayjs from 'dayjs'
import { saveAs } from 'file-saver'
import * as echarts from 'echarts'

const route = useRoute()
const loading = ref(false)
const report = ref<EvaluationReport | null>(null)
const accuracyChart = ref<HTMLElement>()
const performanceChart = ref<HTMLElement>()
const robustnessChart = ref<HTMLElement>()
const errorChart = ref<HTMLElement>()

onMounted(async () => {
  await loadReport()
  await nextTick()
  renderCharts()
})

async function loadReport() {
  loading.value = true
  try {
    report.value = await reportApi.getReport(route.params.id as string)
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function renderCharts() {
  if (!report.value) return

  // Accuracy Chart
  if (accuracyChart.value) {
    const chart = echarts.init(accuracyChart.value)
    const data = report.value.detailedMetrics.accuracy.map((m, i) => ({
      value: [(1 - m.wer) * 100, (1 - m.cer) * 100, (1 - m.ser) * 100],
      name: `Sample ${i + 1}`
    }))
    chart.setOption({
      title: { text: 'Accuracy Metrics' },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: ['WER', 'CER', 'SER']
      },
      yAxis: { type: 'value', max: 100 },
      series: [{
        type: 'bar',
        data: data.length > 0 ? data[0].value : []
      }]
    })
  }

  // Performance Chart
  if (performanceChart.value) {
    const chart = echarts.init(performanceChart.value)
    const trends = report.value.detailedMetrics.trends.filter(t => t.metric.includes('latency') || t.metric.includes('throughput'))
    chart.setOption({
      title: { text: 'Performance Trends' },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: trends[0]?.timestamps.map(t => dayjs(t).format('HH:mm:ss')) || []
      },
      yAxis: { type: 'value' },
      series: trends.map(t => ({
        name: t.metric,
        type: 'line',
        data: t.values
      }))
    })
  }

  // Error Distribution Chart
  if (errorChart.value) {
    const chart = echarts.init(errorChart.value)
    const errorData = report.value.errorDistribution
    chart.setOption({
      title: { text: 'Error Type Distribution' },
      tooltip: {},
      series: [{
        type: 'pie',
        data: [
          { value: errorData.substitution, name: 'Substitution' },
          { value: errorData.insertion, name: 'Insertion' },
          { value: errorData.deletion, name: 'Deletion' },
          { value: errorData.timeout, name: 'Timeout' },
          { value: errorData.api_error, name: 'API Error' },
          { value: errorData.format_error, name: 'Format Error' }
        ]
      }]
    })
  }
}

async function handleExportPDF() {
  if (!report.value) return
  try {
    const blob = await reportApi.exportPDF(report.value.id)
    saveAs(blob, `report_${report.value.id}_${dayjs().format('YYYY-MM-DD')}.pdf`)
    ElMessage.success('Export successful')
  } catch (error: any) {
    ElMessage.error(error.message || 'Export failed')
  }
}

async function handleExportExcel() {
  if (!report.value) return
  try {
    const blob = await reportApi.exportExcel(report.value.id)
    saveAs(blob, `report_${report.value.id}_${dayjs().format('YYYY-MM-DD')}.xlsx`)
    ElMessage.success('Export successful')
  } catch (error: any) {
    ElMessage.error(error.message || 'Export failed')
  }
}

async function handleShare() {
  if (!report.value) return
  try {
    const result = await reportApi.getShareLink(report.value.id)
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
  }
}

ul {
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 8px;
  }
}
</style>
