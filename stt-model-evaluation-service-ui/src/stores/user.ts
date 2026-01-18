import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authApi } from '@/api/auth'
import { AUTH_CONFIG } from '@/config/auth'

// Default user (used when login is disabled)
const DEFAULT_USER: User = {
  id: 'default',
  username: 'Guest',
  email: 'guest@example.com',
  role: 'admin', // Default admin role for full access
  projectIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const useUserStore = defineStore('user', () => {
  // Use default user if auth is disabled
  const user = ref<User | null>(AUTH_CONFIG.ENABLE_AUTH ? null : DEFAULT_USER)
  const token = ref<string | null>(AUTH_CONFIG.ENABLE_AUTH ? localStorage.getItem('token') : 'disabled')

  const isAuthenticated = computed(() => {
    if (!AUTH_CONFIG.ENABLE_AUTH) {
      return true // Consider authenticated when auth is disabled
    }
    return !!token.value && !!user.value
  })

  async function login(username: string, password: string) {
    if (!AUTH_CONFIG.ENABLE_AUTH) {
      // Return default user when auth is disabled
      user.value = DEFAULT_USER
      token.value = 'disabled'
      return { token: 'disabled', user: DEFAULT_USER }
    }
    const response = await authApi.login({ username, password })
    token.value = response.token
    user.value = response.user
    localStorage.setItem('token', response.token)
    return response
  }

  async function logout() {
    if (!AUTH_CONFIG.ENABLE_AUTH) {
      // Do nothing when auth is disabled
      return
    }
    await authApi.logout()
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchCurrentUser() {
    if (!AUTH_CONFIG.ENABLE_AUTH) {
      // Use default user when auth is disabled
      user.value = DEFAULT_USER
      return
    }
    try {
      user.value = await authApi.getCurrentUser()
    } catch (error) {
      token.value = null
      localStorage.removeItem('token')
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    fetchCurrentUser
  }
})
