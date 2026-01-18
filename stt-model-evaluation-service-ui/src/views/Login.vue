<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>STT Model Evaluation System</h2>
        </div>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" placeholder="Please enter username" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Please enter password"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
            Login
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { AUTH_CONFIG } from '@/config/auth'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

// Redirect to home if auth is disabled
onMounted(() => {
  if (!AUTH_CONFIG.ENABLE_AUTH) {
    router.push('/')
  }
})

const form = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }]
}

async function handleLogin() {
  if (!AUTH_CONFIG.ENABLE_AUTH) {
    ElMessage.warning('Login feature is currently disabled')
    router.push('/')
    return
  }
  
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(form.username, form.password)
        ElMessage.success('Login successful')
        router.push('/')
      } catch (error: any) {
        ElMessage.error(error.message || 'Login failed')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    width: 400px;

    .card-header {
      text-align: center;
      h2 {
        margin: 0;
        color: #409eff;
      }
    }
  }
}
</style>
