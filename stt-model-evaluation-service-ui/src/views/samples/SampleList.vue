<template>
  <div class="page-container">
    <div class="page-header">
      <h2>Sample Management</h2>
      <div>
        <el-button type="primary" @click="$router.push('/samples/upload')">
          <el-icon><Upload /></el-icon>
          Upload Sample
        </el-button>
        <el-button @click="handleBatchImport">
          <el-icon><UploadFilled /></el-icon>
          Batch Import
        </el-button>
        <el-button @click="handleBatchExport">
          <el-icon><Download /></el-icon>
          Batch Export
        </el-button>
      </div>
    </div>

    <el-card>
      <el-form :model="filter" inline class="filter-form">
        <el-form-item label="Industry">
          <el-select v-model="filter.industry" multiple placeholder="Please select" clearable>
            <el-option label="Finance" value="finance" />
            <el-option label="Manufacturing" value="manufacturing" />
            <el-option label="Government" value="government" />
            <el-option label="Healthcare" value="healthcare" />
            <el-option label="Education" value="education" />
            <el-option label="Retail" value="retail" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Scenario">
          <el-select v-model="filter.scenario" multiple placeholder="Please select" clearable>
            <el-option label="User Interview" value="user_interview" />
            <el-option label="Call Center" value="call_center" />
            <el-option label="Counter Service" value="counter_service" />
            <el-option label="Meeting" value="meeting" />
            <el-option label="Broadcast" value="broadcast" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Noise Level">
          <el-select v-model="filter.noiseLevel" multiple placeholder="Please select" clearable>
            <el-option label="Low" value="low" />
            <el-option label="Medium" value="medium" />
            <el-option label="High" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="Keyword">
          <el-input v-model="filter.keyword" placeholder="Search sample name" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="sampleStore.loading"
        :data="sampleStore.samples"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="Sample Name" width="200" />
        <el-table-column prop="industry" label="Industry" width="120">
          <template #default="{ row }">
            {{ getIndustryLabel(row.industry) }}
          </template>
        </el-table-column>
        <el-table-column prop="scenario" label="Scenario" width="150">
          <template #default="{ row }">
            {{ getScenarioLabel(row.scenario) }}
          </template>
        </el-table-column>
        <el-table-column prop="noiseLevel" label="Noise Level" width="120">
          <template #default="{ row }">
            {{ getNoiseLevelLabel(row.noiseLevel) }}
          </template>
        </el-table-column>
        <el-table-column prop="format" label="Format" width="100" />
        <el-table-column prop="duration" label="Duration (s)" width="120">
          <template #default="{ row }">
            {{ row.duration ? row.duration.toFixed(2) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handlePlay(row)">Play</el-button>
            <el-button link type="primary" @click="handleEdit(row)">Edit</el-button>
            <el-button link type="danger" @click="handleDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="sampleStore.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- Audio Player Dialog -->
    <el-dialog v-model="playerVisible" title="Audio Playback" width="600px">
      <audio v-if="currentAudio" :src="currentAudio" controls style="width: 100%" />
    </el-dialog>

    <!-- Batch Import Dialog -->
    <el-dialog v-model="importVisible" title="Batch Import" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls"
      >
        <template #trigger>
          <el-button type="primary">Select File</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip">Excel format files supported</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleImportSubmit">Import</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSampleStore } from '@/stores/samples'
import { sampleApi } from '@/api/samples'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { Upload, UploadFilled, Download } from '@element-plus/icons-vue'
import type { SampleFilter } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const sampleStore = useSampleStore()

const filter = reactive<SampleFilter>({})
const pagination = reactive({ page: 1, pageSize: 20 })
const playerVisible = ref(false)
const currentAudio = ref('')
const importVisible = ref(false)
const uploadRef = ref()
const importFile = ref<File>()

onMounted(() => {
  loadSamples()
})

function loadSamples() {
  sampleStore.fetchSamples(pagination.page, pagination.pageSize, filter)
}

function handleSearch() {
  pagination.page = 1
  loadSamples()
}

function handleReset() {
  Object.assign(filter, {})
  handleSearch()
}

function handlePageChange() {
  loadSamples()
}

function handleSizeChange() {
  loadSamples()
}

function handlePlay(row: any) {
  currentAudio.value = row.fileUrl
  playerVisible.value = true
}

function handleEdit(row: any) {
  router.push(`/samples/${row.id}`)
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this sample? Associated test records will also be deleted.', 'Confirm', {
      type: 'warning'
    })
    await sampleStore.deleteSample(row.id)
    ElMessage.success('Deleted successfully')
    loadSamples()
  } catch (error) {
    // User cancelled
  }
}

function handleBatchImport() {
  importVisible.value = true
}

function handleFileChange(file: UploadFile) {
  importFile.value = file.raw
}

async function handleImportSubmit() {
  if (!importFile.value) {
    ElMessage.warning('Please select a file')
    return
  }
  try {
    const result = await sampleApi.batchImport(importFile.value)
    ElMessage.success(`Import successful: ${result.success} succeeded, ${result.failed} failed`)
    importVisible.value = false
    loadSamples()
  } catch (error: any) {
    ElMessage.error(error.message || 'Import failed')
  }
}

async function handleBatchExport() {
  try {
    const blob = await sampleApi.batchExport(filter)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `samples_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('Export successful')
  } catch (error: any) {
    ElMessage.error(error.message || 'Export failed')
  }
}

function getIndustryLabel(value: string) {
  const map: Record<string, string> = {
    finance: 'Finance',
    manufacturing: 'Manufacturing',
    government: 'Government',
    healthcare: 'Healthcare',
    education: 'Education',
    retail: 'Retail',
    other: 'Other'
  }
  return map[value] || value
}

function getScenarioLabel(value: string) {
  const map: Record<string, string> = {
    user_interview: 'User Interview',
    call_center: 'Call Center',
    counter_service: 'Counter Service',
    meeting: 'Meeting',
    broadcast: 'Broadcast',
    other: 'Other'
  }
  return map[value] || value
}

function getNoiseLevelLabel(value: string) {
  const map: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
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

.filter-form {
  margin-bottom: 20px;
}
</style>
