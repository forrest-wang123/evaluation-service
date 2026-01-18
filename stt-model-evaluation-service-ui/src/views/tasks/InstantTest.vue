<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h3>Instant Test</h3>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px"
      >
        <el-form-item label="Select Model" prop="modelId">
          <el-select v-model="form.modelId" placeholder="Please select model" style="width: 100%">
            <el-option
              v-for="model in availableModels"
              :key="model.id"
              :label="`${model.name} (${model.vendor})`"
              :value="model.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Audio File" prop="audioFile">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :limit="1"
            accept="audio/*"
          >
            <el-button type="primary">Select File</el-button>
            <template #tip>
              <div class="el-upload__tip">Audio file upload supported</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="Or Record Live">
          <el-button @click="handleRecord" :disabled="isRecording">
            <el-icon><VideoCamera /></el-icon>
            {{ isRecording ? 'Recording...' : 'Start Recording' }}
          </el-button>
          <el-button v-if="isRecording" @click="handleStopRecord" type="danger">Stop Recording</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="testing" @click="handleTest">Start Test</el-button>
        </el-form-item>
      </el-form>

      <el-card v-if="testResult" style="margin-top: 20px">
        <template #header>
          <h4>Test Result</h4>
        </template>
        <el-input
          v-model="testResult.result"
          type="textarea"
          :rows="5"
          placeholder="Recognition result will be displayed here"
          readonly
        />
        <el-form-item label="Label Text" style="margin-top: 20px">
          <el-input
            v-model="testResult.label"
            type="textarea"
            :rows="3"
            placeholder="Please enter label text (optional)"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveAsSample">Save as Sample</el-button>
        </el-form-item>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { taskApi } from '@/api/tasks'
import { modelApi } from '@/api/models'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { VideoCamera } from '@element-plus/icons-vue'
import type { Model, InstantTest } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const uploadRef = ref()
const testing = ref(false)
const isRecording = ref(false)
const availableModels = ref<Model[]>([])
const testResult = ref<Partial<InstantTest> | null>(null)

const form = reactive({
  modelId: '',
  audioFile: null as File | null
})

const rules: FormRules = {
  modelId: [{ required: true, message: 'Please select model', trigger: 'change' }],
  audioFile: [
    {
      validator: (rule, value, callback) => {
        if (!form.audioFile) {
          callback(new Error('Please select audio file or record audio'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

onMounted(async () => {
  await loadModels()
})

async function loadModels() {
  try {
    const response = await modelApi.getModels({ page: 1, pageSize: 1000 })
    availableModels.value = response.items
  } catch (error: any) {
    ElMessage.error('Failed to load model list')
  }
}

function handleFileChange(file: UploadFile) {
  form.audioFile = file.raw as File
}

function handleFileRemove() {
  form.audioFile = null
}

function handleRecord() {
  // TODO: Implement audio recording
  ElMessage.info('Audio recording feature is under development')
  isRecording.value = true
}

function handleStopRecord() {
  // TODO: Implement stop recording
  isRecording.value = false
  ElMessage.info('Audio recording feature is under development')
}

async function handleTest() {
  if (!formRef.value || !form.audioFile) return

  await formRef.value.validate(async (valid) => {
    if (valid && form.audioFile) {
      testing.value = true
      try {
        const result = await taskApi.instantTest({
          audioFile: form.audioFile,
          modelId: form.modelId
        })
        testResult.value = {
          result: result.result || '',
          label: ''
        }
        ElMessage.success('Test completed')
      } catch (error: any) {
        ElMessage.error(error.message || 'Test failed')
      } finally {
        testing.value = false
      }
    }
  })
}

async function handleSaveAsSample() {
  if (!testResult.value || !form.audioFile) {
    ElMessage.warning('Please complete the test first')
    return
  }
  // TODO: Implement save as sample
  ElMessage.info('Save as sample feature is under development')
  router.push('/samples/upload')
}
</script>

<style scoped lang="scss">
</style>
