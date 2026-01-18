import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { AUTH_CONFIG } from '@/config/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/samples',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/samples',
        name: 'Samples',
        component: () => import('@/views/samples/SampleList.vue'),
        meta: { title: 'Sample Management' }
      },
      {
        path: '/samples/upload',
        name: 'SampleUpload',
        component: () => import('@/views/samples/SampleUpload.vue'),
        meta: { title: 'Upload Sample' }
      },
      {
        path: '/samples/:id',
        name: 'SampleDetail',
        component: () => import('@/views/samples/SampleDetail.vue'),
        meta: { title: 'Sample Detail' }
      },
      {
        path: '/models',
        name: 'Models',
        component: () => import('@/views/models/ModelList.vue'),
        meta: { title: 'Model Management' }
      },
      {
        path: '/models/create',
        name: 'ModelCreate',
        component: () => import('@/views/models/ModelForm.vue'),
        meta: { title: 'Integrate Model' }
      },
      {
        path: '/models/:id',
        name: 'ModelDetail',
        component: () => import('@/views/models/ModelDetail.vue'),
        meta: { title: 'Model Detail' }
      },
      {
        path: '/models/:id/edit',
        name: 'ModelEdit',
        component: () => import('@/views/models/ModelForm.vue'),
        meta: { title: 'Edit Model' }
      },
      {
        path: '/tasks',
        name: 'Tasks',
        component: () => import('@/views/tasks/TaskList.vue'),
        meta: { title: 'Task Management' }
      },
      {
        path: '/tasks/create',
        name: 'TaskCreate',
        component: () => import('@/views/tasks/TaskForm.vue'),
        meta: { title: 'Create Task' }
      },
      {
        path: '/tasks/:id',
        name: 'TaskDetail',
        component: () => import('@/views/tasks/TaskDetail.vue'),
        meta: { title: 'Task Detail' }
      },
      {
        path: '/tasks/:id/results',
        name: 'TaskResults',
        component: () => import('@/views/tasks/TaskResults.vue'),
        meta: { title: 'Task Results' }
      },
      {
        path: '/instant-test',
        name: 'InstantTest',
        component: () => import('@/views/tasks/InstantTest.vue'),
        meta: { title: 'Instant Test' }
      },
      {
        path: '/reports',
        name: 'Reports',
        component: () => import('@/views/reports/ReportList.vue'),
        meta: { title: 'Evaluation Reports' }
      },
      {
        path: '/reports/:id',
        name: 'ReportDetail',
        component: () => import('@/views/reports/ReportDetail.vue'),
        meta: { title: 'Report Detail' }
      },
      {
        path: '/system/users',
        name: 'Users',
        component: () => import('@/views/system/UserManagement.vue'),
        meta: { title: 'User Management', requiresRole: ['admin'] }
      },
      {
        path: '/system/config',
        name: 'SystemConfig',
        component: () => import('@/views/system/SystemConfig.vue'),
        meta: { title: 'System Configuration', requiresRole: ['admin'] }
      },
      {
        path: '/system/audit',
        name: 'AuditLogs',
        component: () => import('@/views/system/AuditLogs.vue'),
        meta: { title: 'Audit Logs', requiresRole: ['admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // If auth is disabled, skip all authentication checks
  if (!AUTH_CONFIG.ENABLE_AUTH) {
    // If accessing login page, redirect to home
    if (to.path === '/login') {
      next('/')
      return
    }
    next()
    return
  }
  
  // Normal flow when auth is enabled
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresRole && !to.meta.requiresRole.includes(userStore.user?.role || '')) {
    next('/')
  } else {
    next()
  }
})

export default router
