<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h3>Create Test Task</h3>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        style="max-width: 800px"
      >
        <el-form-item label="Task Name" prop="name">
          <el-input v-model="form.name" placeholder="Please enter task name" />
        </el-form-item>
        <el-form-item label="Task Description" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Please enter task description"
          />
        </el-form-item>
        <el-divider>Execution Parameters</el-divider>
        <el-form-item label="Concurrency" prop="executionParams.concurrency">
          <el-input-number v-model="form.executionParams.concurrency" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="Loop Mode" prop="executionParams.loopMode">
          <el-switch v-model="form.executionParams.loopMode" />
        </el-form-item>
        <el-form-item label="Duration (seconds)" prop="executionParams.duration">
          <el-input-number v-model="form.executionParams.duration" :min="0" placeholder="0 means unlimited" />
        </el-form-item>
        <el-divider>Sample Selection</el-divider>
        <el-form-item label="Selection Method" prop="sampleSelection.type">
          <el-radio-group v-model="form.sampleSelection.type" @change="handleSampleSelectionChange">
            <el-radio label="manual">Manual Selection</el-radio>
            <el-radio label="filter">Conditional Filter</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.sampleSelection.type === 'manual'"
          label="Select Samples"
          prop="sampleSelection.sampleIds"
        >
          <el-select
            v-model="form.sampleSelection.sampleIds"
            multiple
            filterable
            placeholder="Please select samples"
            style="width: 100%"
          >
            <el-option
              v-for="sample in availableSamples"
              :key="sample.id"
              :label="sample.name"
              :value="sample.id"
            />
          </el-select>
        </el-form-item>
        <template v-if="form.sampleSelection.type === 'filter'">
          <el-form-item label="Industry">
            <el-select v-model="form.sampleSelection.filters.industry" multiple placeholder="Please select" clearable>
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
            <el-select v-model="form.sampleSelection.filters.scenario" multiple placeholder="Please select" clearable>
              <el-option label="User Interview" value="user_interview" />
              <el-option label="Call Center" value="call_center" />
              <el-option label="Counter Service" value="counter_service" />
              <el-option label="Meeting" value="meeting" />
              <el-option label="Broadcast" value="broadcast" />
              <el-option label="Other" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="Noise Level">
            <el-select v-model="form.sampleSelection.filters.noiseLevel" multiple placeholder="Please select" clearable>
              <el-option label="Low" value="low" />
              <el-option label="Medium" value="medium" />
              <el-option label="High" value="high" />
            </el-select>
          </el-form-item>
        </template>
        <el-divider>Model Selection</el-divider>
        <el-form-item label="Test Type" prop="modelSelection.type">
          <el-radio-group v-model="form.modelSelection.type">
            <el-radio label="single">Single Model Test</el-radio>
            <el-radio label="comparative">Multi-Model Comparison</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Select Models" prop="modelSelection.modelIds">
          <el-select
            v-model="form.modelSelection.modelIds"
            multiple
            filterable
            placeholder="Please select models"
            style="width: 100%"
          >
            <el-option
              v-for="model in availableModels"
              :key="model.id"
              :label="`${model.name} (${model.vendor})`"
              :value="model.id"
            />
          </el-select>
        </el-form-item>
        <el-divider>Schedule Settings</el-divider>
        <el-form-item label="Execution Method" prop="schedule.type">
          <el-radio-group v-model="form.schedule.type">
            <el-radio label="immediate">Execute Immediately</el-radio>
            <el-radio label="scheduled">Scheduled Execution</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.schedule.type === 'scheduled'"
          label="Execution Time"
          prop="schedule.scheduledTime"
        >
          <el-date-picker
            v-model="form.schedule.scheduledTime"
            type="datetime"
            placeholder="Select execution time"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">Create Task</el-button>
          <el-button @click="$router.back()">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { taskApi } from '@/api/tasks'
import { sampleApi } from '@/api/samples'
import { modelApi } from '@/api/models'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { TestTask, Sample, Model } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const availableSamples = ref<Sample[]>([])
const availableModels = ref<Model[]>([])

const form = reactive<Partial<TestTask>>({
  name: '',
  description: '',
  executionParams: {
    concurrency: 1,
    loopMode: false,
    duration: 0
  },
  sampleSelection: {
    type: 'manual',
    sampleIds: [],
    filters: {}
  },
  modelSelection: {
    type: 'single',
    modelIds: []
  },
  schedule: {
    type: 'immediate',
    scheduledTime: undefined
  }
})

const rules: FormRules = {
  name: [{ required: true, message: 'Please enter task name', trigger: 'blur' }],
  'executionParams.concurrency': [{ required: true, message: 'Please enter concurrency', trigger: 'blur' }],
  'sampleSelection.sampleIds': [
    {
      validator: (rule, value, callback) => {
        if (form.sampleSelection.type === 'manual' && (!value || value.length === 0)) {
          callback(new Error('Please select at least one sample'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  'modelSelection.modelIds': [
    { required: true, message: 'Please select at least one model', trigger: 'change' }
  ]
}

onMounted(async () => {
  await Promise.all([loadSamples(), loadModels()])
})

async function loadSamples() {
  try {
    const response = await sampleApi.getSamples({ page: 1, pageSize: 1000 })
    availableSamples.value = response.items
  } catch (error: any) {
    ElMessage.error('Failed to load sample list')
  }
}

async function loadModels() {
  try {
    const response = await modelApi.getModels({ page: 1, pageSize: 1000 })
    availableModels.value = response.items
  } catch (error: any) {
    ElMessage.error('Failed to load model list')
  }
}

function handleSampleSelectionChange() {
  if (form.sampleSelection.type === 'filter') {
    form.sampleSelection.sampleIds = []
  } else {
    form.sampleSelection.filters = {}
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await taskApi.createTask(form as any)
        ElMessage.success('Task created successfully')
        router.push('/tasks')
      } catch (error: any) {
        ElMessage.error(error.message || 'Creation failed')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
</style>
