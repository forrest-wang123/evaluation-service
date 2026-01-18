<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <h3>{{ isEdit ? 'Edit Model' : 'Integrate Model' }}</h3>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        style="max-width: 800px"
      >
        <el-form-item label="Model Name" prop="name">
          <el-input v-model="form.name" placeholder="Please enter model name" />
        </el-form-item>
        <el-form-item label="Vendor" prop="vendor">
          <el-input v-model="form.vendor" placeholder="Please enter vendor name" />
        </el-form-item>
        <el-form-item label="Version" prop="version">
          <el-input v-model="form.version" placeholder="Please enter version number" />
        </el-form-item>
        <el-form-item label="Interface Type" prop="interfaceType">
          <el-select v-model="form.interfaceType" placeholder="Please select interface type" @change="handleInterfaceTypeChange">
            <el-option label="HTTP API" value="http_api" />
            <el-option label="gRPC" value="grpc" />
            <el-option label="WebSocket" value="websocket" />
          </el-select>
        </el-form-item>
        <el-form-item label="Protocol" prop="protocol">
          <el-select v-model="form.protocol" placeholder="Please select protocol">
            <el-option label="HTTP" value="http" />
            <el-option label="HTTPS" value="https" />
            <el-option label="WS" value="ws" />
            <el-option label="WSS" value="wss" />
            <el-option label="gRPC" value="grpc" />
          </el-select>
        </el-form-item>
        <el-form-item label="Endpoint" prop="endpoint">
          <el-input v-model="form.endpoint" placeholder="e.g., api.example.com" />
        </el-form-item>
        <el-form-item label="Port" prop="port">
          <el-input-number v-model="form.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="Authentication" prop="authConfig.type">
          <el-select v-model="form.authConfig.type" placeholder="Please select authentication method" @change="handleAuthTypeChange">
            <el-option label="None" value="none" />
            <el-option label="API Key" value="api_key" />
            <el-option label="Token" value="token" />
            <el-option label="Username/Password" value="username_password" />
            <el-option label="OAuth" value="oauth" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.authConfig.type === 'api_key'"
          label="API Key"
          prop="authConfig.apiKey"
        >
          <el-input v-model="form.authConfig.apiKey" type="password" show-password placeholder="Please enter API Key" />
        </el-form-item>
        <el-form-item
          v-if="form.authConfig.type === 'token'"
          label="Token"
          prop="authConfig.token"
        >
          <el-input v-model="form.authConfig.token" type="password" show-password placeholder="Please enter Token" />
        </el-form-item>
        <template v-if="form.authConfig.type === 'username_password'">
          <el-form-item label="Username" prop="authConfig.username">
            <el-input v-model="form.authConfig.username" placeholder="Please enter username" />
          </el-form-item>
          <el-form-item label="Password" prop="authConfig.password">
            <el-input v-model="form.authConfig.password" type="password" show-password placeholder="Please enter password" />
          </el-form-item>
        </template>
        <template v-if="form.authConfig.type === 'oauth'">
          <el-form-item label="Client ID" prop="authConfig.oauthConfig.clientId">
            <el-input v-model="form.authConfig.oauthConfig.clientId" placeholder="Please enter Client ID" />
          </el-form-item>
          <el-form-item label="Client Secret" prop="authConfig.oauthConfig.clientSecret">
            <el-input v-model="form.authConfig.oauthConfig.clientSecret" type="password" show-password placeholder="Please enter Client Secret" />
          </el-form-item>
          <el-form-item label="Token URL" prop="authConfig.oauthConfig.tokenUrl">
            <el-input v-model="form.authConfig.oauthConfig.tokenUrl" placeholder="Please enter Token URL" />
          </el-form-item>
          <el-form-item label="Scope" prop="authConfig.oauthConfig.scope">
            <el-input v-model="form.authConfig.oauthConfig.scope" placeholder="Please enter Scope (optional)" />
          </el-form-item>
        </template>
        <el-form-item label="Supported Languages" prop="supportedLanguages">
          <el-select
            v-model="form.supportedLanguages"
            multiple
            filterable
            placeholder="Please select supported languages"
            style="width: 100%"
          >
            <el-option label="Chinese" value="zh" />
            <el-option label="English" value="en" />
            <el-option label="Japanese" value="ja" />
            <el-option label="Korean" value="ko" />
            <el-option label="French" value="fr" />
            <el-option label="German" value="de" />
            <el-option label="Spanish" value="es" />
          </el-select>
        </el-form-item>
        <el-form-item label="Sampling Rate" prop="samplingRate">
          <el-select v-model="form.samplingRate" placeholder="Please select sampling rate">
            <el-option label="8000 Hz" :value="8000" />
            <el-option label="16000 Hz" :value="16000" />
            <el-option label="44100 Hz" :value="44100" />
            <el-option label="48000 Hz" :value="48000" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">Save</el-button>
          <el-button @click="$router.back()">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { modelApi } from '@/api/models'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Model } from '@/types'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const isEdit = ref(false)

const form = reactive<Partial<Model>>({
  name: '',
  vendor: '',
  version: '',
  interfaceType: 'http_api',
  protocol: 'https',
  endpoint: '',
  port: 443,
  authConfig: {
    type: 'none',
    apiKey: '',
    token: '',
    username: '',
    password: '',
    oauthConfig: {
      clientId: '',
      clientSecret: '',
      tokenUrl: '',
      scope: ''
    }
  },
  supportedLanguages: [],
  samplingRate: 16000
})

const rules: FormRules = {
  name: [{ required: true, message: 'Please enter model name', trigger: 'blur' }],
  vendor: [{ required: true, message: 'Please enter vendor name', trigger: 'blur' }],
  version: [{ required: true, message: 'Please enter version number', trigger: 'blur' }],
  interfaceType: [{ required: true, message: 'Please select interface type', trigger: 'change' }],
  protocol: [{ required: true, message: 'Please select protocol', trigger: 'change' }],
  endpoint: [{ required: true, message: 'Please enter endpoint address', trigger: 'blur' }],
  port: [{ required: true, message: 'Please enter port', trigger: 'blur' }],
  'authConfig.type': [{ required: true, message: 'Please select authentication method', trigger: 'change' }],
  supportedLanguages: [{ required: true, message: 'Please select supported languages', trigger: 'change' }],
  samplingRate: [{ required: true, message: 'Please select sampling rate', trigger: 'change' }]
}

onMounted(async () => {
  if (route.params.id && route.name === 'ModelEdit') {
    isEdit.value = true
    await loadModel()
  }
})

async function loadModel() {
  loading.value = true
  try {
    const model = await modelApi.getModel(route.params.id as string)
    Object.assign(form, model)
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function handleInterfaceTypeChange() {
  // Auto-set protocol based on interface type
  if (form.interfaceType === 'grpc') {
    form.protocol = 'grpc'
  } else if (form.interfaceType === 'websocket') {
    form.protocol = 'wss'
  } else {
    form.protocol = 'https'
  }
}

function handleAuthTypeChange() {
  // Reset auth config when type changes
  form.authConfig = {
    type: form.authConfig?.type || 'none',
    apiKey: '',
    token: '',
    username: '',
    password: '',
    oauthConfig: {
      clientId: '',
      clientSecret: '',
      tokenUrl: '',
      scope: ''
    }
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          await modelApi.updateModel(route.params.id as string, form)
          ElMessage.success('Updated successfully')
        } else {
          await modelApi.createModel(form as any)
          ElMessage.success('Created successfully')
        }
        router.push('/models')
      } catch (error: any) {
        ElMessage.error(error.message || 'Save failed')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
</style>
