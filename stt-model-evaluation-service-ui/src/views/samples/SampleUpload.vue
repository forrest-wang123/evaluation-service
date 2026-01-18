<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>Upload Sample</h3>
        </div>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px"
      >
        <el-form-item label="Audio File" prop="file">
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
              <div class="el-upload__tip">Supports mp3, wav, aac, pcm formats</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="Sample Name" prop="name">
          <el-input v-model="form.name" placeholder="Please enter sample name" />
        </el-form-item>
        <el-form-item label="Industry" prop="industry">
          <el-select v-model="form.industry" placeholder="Please select industry">
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
          <el-select v-model="form.scenario" placeholder="Please select scenario">
            <el-option label="User Interview" value="user_interview" />
            <el-option label="Call Center" value="call_center" />
            <el-option label="Counter Service" value="counter_service" />
            <el-option label="Meeting" value="meeting" />
            <el-option label="Broadcast" value="broadcast" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Noise Level" prop="noiseLevel">
          <el-select v-model="form.noiseLevel" placeholder="Please select noise level">
            <el-option label="Low" value="low" />
            <el-option label="Medium" value="medium" />
            <el-option label="High" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="Playback Parameters">
          <el-form-item label="Volume" style="margin-bottom: 10px">
            <el-slider v-model="form.playbackParams.volume" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="Speed" style="margin-bottom: 10px">
            <el-slider v-model="form.playbackParams.speed" :min="0.5" :max="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="Loop">
            <el-switch v-model="form.playbackParams.loop" />
          </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">Upload</el-button>
          <el-button @click="$router.back()">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSampleStore } from '@/stores/samples'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'

const router = useRouter()
const sampleStore = useSampleStore()
const formRef = ref<FormInstance>()
const uploadRef = ref()
const loading = ref(false)

const form = reactive({
  file: null as File | null,
  name: '',
  industry: '',
  scenario: '',
  noiseLevel: '',
  playbackParams: {
    volume: 80,
    speed: 1,
    loop: false
  }
})

const rules: FormRules = {
  file: [{ required: true, message: 'Please select an audio file', trigger: 'change' }],
  name: [{ required: true, message: 'Please enter sample name', trigger: 'blur' }],
  industry: [{ required: true, message: 'Please select industry', trigger: 'change' }],
  scenario: [{ required: true, message: 'Please select scenario', trigger: 'change' }],
  noiseLevel: [{ required: true, message: 'Please select noise level', trigger: 'change' }]
}

function handleFileChange(file: UploadFile) {
  form.file = file.raw as File
  if (!form.name && file.name) {
    form.name = file.name.replace(/\.[^/.]+$/, '')
  }
}

function handleFileRemove() {
  form.file = null
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid && form.file) {
      loading.value = true
      try {
        await sampleStore.uploadSample({
          file: form.file,
          name: form.name,
          industry: form.industry as any,
          scenario: form.scenario as any,
          noiseLevel: form.noiseLevel as any,
          playbackParams: form.playbackParams
        })
        ElMessage.success('Upload successful')
        router.push('/samples')
      } catch (error: any) {
        ElMessage.error(error.message || 'Upload failed')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.card-header {
  h3 {
    margin: 0;
  }
}
</style>
