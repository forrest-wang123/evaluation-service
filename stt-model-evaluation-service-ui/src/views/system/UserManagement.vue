<template>
  <div class="page-container">
    <div class="page-header">
      <h2>User Management</h2>
      <el-button type="primary" @click="handleCreate">Create User</el-button>
    </div>

    <el-card>
      <el-table
        v-loading="loading"
        :data="users"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="username" label="Username" width="150" />
        <el-table-column prop="email" label="Email" width="200" />
        <el-table-column prop="role" label="Role" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="projectIds" label="Projects" width="200">
          <template #default="{ row }">
            {{ row.projectIds.length }} projects
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">Edit</el-button>
            <el-button link type="danger" @click="handleDelete(row)">Delete</el-button>
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

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit User' : 'Create User'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="Password" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="form.role" placeholder="Please select role">
            <el-option label="Admin" value="admin" />
            <el-option label="Tester" value="tester" />
            <el-option label="Viewer" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { systemApi } from '@/api/system'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import type { User } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const users = ref<User[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, pageSize: 20 })

const form = reactive<Partial<User>>({
  username: '',
  email: '',
  password: '',
  role: 'viewer',
  projectIds: []
})

const rules: FormRules = {
  username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }],
  role: [{ required: true, message: 'Please select role', trigger: 'change' }]
}

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const response = await systemApi.getUsers({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    users.value = response.items
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || 'Load failed')
  } finally {
    loading.value = false
  }
}

function handlePageChange() {
  loadUsers()
}

function handleSizeChange() {
  loadUsers()
}

function handleCreate() {
  isEdit.value = false
  Object.assign(form, {
    username: '',
    email: '',
    password: '',
    role: 'viewer',
    projectIds: []
  })
  dialogVisible.value = true
}

function handleEdit(row: User) {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (isEdit.value) {
          await systemApi.updateUser(form.id!, form)
          ElMessage.success('Updated successfully')
        } else {
          await systemApi.createUser(form as any)
          ElMessage.success('Created successfully')
        }
        dialogVisible.value = false
        loadUsers()
      } catch (error: any) {
        ElMessage.error(error.message || 'Save failed')
      } finally {
        saving.value = false
      }
    }
  })
}

async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this user?', 'Confirm', {
      type: 'warning'
    })
    await systemApi.deleteUser(row.id)
    ElMessage.success('Deleted successfully')
    loadUsers()
  } catch (error) {
    // User cancelled
  }
}

function getRoleLabel(value: string) {
  const map: Record<string, string> = {
    admin: 'Admin',
    tester: 'Tester',
    viewer: 'Viewer'
  }
  return map[value] || value
}

function getRoleType(value: string) {
  const map: Record<string, string> = {
    admin: 'danger',
    tester: 'warning',
    viewer: 'info'
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
