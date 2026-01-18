<template>
  <div class="page-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h3>Sample Detail</h3>
          <div>
            <el-button type="primary" @click="handleEdit">Edit</el-button>
            <el-button type="danger" @click="handleDelete">Delete</el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="2" border v-if="sample">
        <el-descriptions-item label="Sample Name">{{ sample.name }}</el-descriptions-item>
        <el-descriptions-item label="File URL">
          <el-link :href="sample.fileUrl" target="_blank" type="primary">{{ sample.fileUrl }}</el-link>
        </el-descriptions-item>
        <el-descriptions-item label="Industry">{{ getIndustryLabel(sample.industry) }}</el-descriptions-item>
        <el-descriptions-item label="Scenario">{{ getScenarioLabel(sample.scenario) }}</el-descriptions-item>
        <el-descriptions-item label="Noise Level">{{ getNoiseLevelLabel(sample.noiseLevel) }}</el-descriptions-item>
        <el-descriptions-item label="Format">{{ sample.format }}</el-descriptions-item>
        <el-descriptions-item label="Duration">{{ sample.duration ? sample.duration.toFixed(2) + ' seconds' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="Audio Fingerprint">{{ sample.fingerprint }}</el-descriptions-item>
        <el-descriptions-item label="Created At">{{ formatDate(sample.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="Updated At">{{ formatDate(sample.updatedAt) }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="sample" style="margin-top: 20px">
        <h4>Audio Playback</h4>
        <audio :src="sample.fileUrl" controls style="width: 100%" />
      </div>

      <div v-if="sample?.playbackParams" style="margin-top: 20px">
        <h4>Playback Parameters</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Volume">{{ sample.playbackParams.volume }}%</el-descriptions-item>
          <el-descriptions-item label="Speed">{{ sample.playbackParams.speed }}x</el-descriptions-item>
          <el-descriptions-item label="Loop">{{ sample.playbackParams.loop ? 'Yes' : 'No' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog v-model="editVisible" title="Edit Sample" width="600px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item label="Sample Name" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="Industry" prop="industry">
          <el-select v-model="editForm.industry" placeholder="Please select">
            <el-option label="Finance" value="finance" />
            <el-option label="Manufacturing" value="manufacturing" />
            <el-option label="Government" value="government" />
            <el-option label="Healthcare" value="healthcare" />
            <el-option label="Education" value="education" />
            <el-option label="Retail" value="retail" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Scenario" prop="scenario">
          <el-select v-model="editForm.scenario" placeholder="Please select">
            <el-option label="User Interview" value="user_interview" />
            <el-option label="Call Center" value="call_center" />
            <el-option label="Counter Service" value="counter_service" />
            <el-option label="Meeting" value="meeting" />
            <el-option label="Broadcast" value="broadcast" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Noise Level" prop="noiseLevel">
          <el-select v-model="editForm.noiseLevel" placeholder="Please select">
            <el-option label="Low" value="low" />
            <el-option label="Medium" value="medium" />
            <el-option label="High" value="high" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSampleStore } from '@/stores/samples'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const sampleStore = useSampleStore()

const loading = ref(false)
const saving = ref(false)
const editVisible = ref(false)
const editFormRef = ref<FormInstance>()

const sample = ref(sampleStore.currentSample)

const editForm = reactive({
  name: '',
  industry: '',
  scenario: '',
  noiseLevel: ''
})

const editRules: FormRules = {
  name: [{ required: true, message: 'Please enter sample name', trigger: 'blur' }],
  industry: [{ required: true, message: 'Please select industry', trigger: 'change' }],
  scenario: [{ required: true, message: 'Please select scenario', trigger: 'change' }],
  noiseLevel: [{ required: true, message: 'Please select noise level', trigger: 'change' }]
}

onMounted(async () => {
  loading.value = true
  try {
    await sampleStore.fetchSample(route.params.id as string)
    sample.value = sampleStore.currentSample
  } finally {
    loading.value = false
  }
})

function handleEdit() {
  if (!sample.value) return
  editForm.name = sample.value.name
  editForm.industry = sample.value.industry
  editForm.scenario = sample.value.scenario
  editForm.noiseLevel = sample.value.noiseLevel
  editVisible.value = true
}

async function handleSave() {
  if (!editFormRef.value || !sample.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await sampleStore.updateSample(sample.value!.id, editForm)
        await sampleStore.fetchSample(sample.value!.id)
        sample.value = sampleStore.currentSample
        editVisible.value = false
        ElMessage.success('Saved successfully')
      } catch (error: any) {
        ElMessage.error(error.message || 'Save failed')
      } finally {
        saving.value = false
      }
    }
  })
}

async function handleDelete() {
  if (!sample.value) return
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this sample? Associated test records will also be deleted.', 'Confirm', {
      type: 'warning'
    })
    await sampleStore.deleteSample(sample.value.id)
    ElMessage.success('Deleted successfully')
    router.push('/samples')
  } catch (error) {
    // User cancelled
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
  }
}
</style>
