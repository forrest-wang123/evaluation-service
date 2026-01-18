<template>
  <div class="page-container">
    <el-card v-loading="loading">
      <template #header>
        <h3>System Configuration</h3>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="200px"
        style="max-width: 800px"
      >
        <el-divider>Evaluation Metric Weights</el-divider>
        <el-form-item label="Accuracy Weight" prop="metricWeights.accuracy">
          <el-input-number
            v-model="form.metricWeights.accuracy"
            :min="0"
            :max="1"
            :step="0.1"
            :precision="2"
          />
          <span style="margin-left: 10px; color: #909399">Range: 0-1</span>
        </el-form-item>
        <el-form-item label="Performance Weight" prop="metricWeights.performance">
          <el-input-number
            v-model="form.metricWeights.performance"
            :min="0"
            :max="1"
            :step="0.1"
            :precision="2"
          />
          <span style="margin-left: 10px; color: #909399">Range: 0-1</span>
        </el-form-item>
        <el-form-item label="Robustness Weight" prop="metricWeights.robustness">
          <el-input-number
            v-model="form.metricWeights.robustness"
            :min="0"
            :max="1"
            :step="0.1"
            :precision="2"
          />
          <span style="margin-left: 10px; color: #909399">Range: 0-1</span>
        </el-form-item>

        <el-divider>Alert Thresholds</el-divider>
        <el-form-item label="Error Rate Threshold (%)" prop="alertThresholds.errorRate">
          <el-input-number
            v-model="form.alertThresholds.errorRate"
            :min="0"
            :max="100"
            :step="1"
          />
          <span style="margin-left: 10px; color: #909399">Alert will be triggered when exceeded</span>
        </el-form-item>
        <el-form-item label="Latency Threshold (ms)" prop="alertThresholds.latency">
          <el-input-number
            v-model="form.alertThresholds.latency"
            :min="0"
            :step="100"
          />
          <span style="margin-left: 10px; color: #909399">Alert will be triggered when exceeded</span>
        </el-form-item>
        <el-form-item label="Resource Usage Threshold (%)" prop="alertThresholds.resourceUsage">
          <el-input-number
            v-model="form.alertThresholds.resourceUsage"
            :min="0"
            :max="100"
            :step="1"
          />
          <span style="margin-left: 10px; color: #909399">Alert will be triggered when exceeded</span>
        </el-form-item>

        <el-divider>SLA Targets</el-divider>
        <el-form-item label="Accuracy Target (%)" prop="slaTargets.accuracy">
          <el-input-number
            v-model="form.slaTargets.accuracy"
            :min="0"
            :max="100"
            :step="1"
          />
          <span style="margin-left: 10px; color: #909399">SLA target value</span>
        </el-form-item>
        <el-form-item label="Latency Target (ms)" prop="slaTargets.latency">
          <el-input-number
            v-model="form.slaTargets.latency"
            :min="0"
            :step="100"
          />
          <span style="margin-left: 10px; color: #909399">SLA target value</span>
        </el-form-item>
        <el-form-item label="Availability Target (%)" prop="slaTargets.availability">
          <el-input-number
            v-model="form.slaTargets.availability"
            :min="0"
            :max="100"
            :step="0.1"
            :precision="2"
          />
          <span style="margin-left: 10px; color: #909399">SLA target value</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">Save Configuration</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { systemApi } from '@/api/system'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { SystemConfig } from '@/types'

const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<SystemConfig>({
  metricWeights: {
    accuracy: 0.4,
    performance: 0.3,
    robustness: 0.3
  },
  alertThresholds: {
    errorRate: 10,
    latency: 1000,
    resourceUsage: 80
  },
  slaTargets: {
    accuracy: 95,
    latency: 500,
    availability: 99.9
  }
})

const originalForm = ref<SystemConfig | null>(null)

const rules: FormRules = {
  'metricWeights.accuracy': [{ required: true, message: 'Please enter accuracy weight', trigger: 'blur' }],
  'metricWeights.performance': [{ required: true, message: 'Please enter performance weight', trigger: 'blur' }],
  'metricWeights.robustness': [{ required: true, message: 'Please enter robustness weight', trigger: 'blur' }],
  'alertThresholds.errorRate': [{ required: true, message: 'Please enter error rate threshold', trigger: 'blur' }],
  'alertThresholds.latency': [{ required: true, message: 'Please enter latency threshold', trigger: 'blur' }],
  'alertThresholds.resourceUsage': [{ required: true, message: 'Please enter resource usage threshold', trigger: 'blur' }],
  'slaTargets.accuracy': [{ required: true, message: 'Please enter accuracy target', trigger: 'blur' }],
  'slaTargets.latency': [{ required: true, message: 'Please enter latency target', trigger: 'blur' }],
  'slaTargets.availability': [{ required: true, message: 'Please enter availability target', trigger: 'blur' }]
}

onMounted(async () => {
  await loadConfig()
})

async function loadConfig() {
  loading.value = true
  try {
    const config = await systemApi.getSystemConfig()
    Object.assign(form, config)
    originalForm.value = JSON.parse(JSON.stringify(config))
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to load configuration')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        await systemApi.updateSystemConfig(form)
        originalForm.value = JSON.parse(JSON.stringify(form))
        ElMessage.success('Saved successfully')
      } catch (error: any) {
        ElMessage.error(error.message || 'Save failed')
      } finally {
        saving.value = false
      }
    }
  })
}

function handleReset() {
  if (originalForm.value) {
    Object.assign(form, originalForm.value)
    ElMessage.info('Reset to original configuration')
  }
}
</script>

<style scoped lang="scss">
</style>
