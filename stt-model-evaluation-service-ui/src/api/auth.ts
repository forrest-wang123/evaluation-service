import api from './index'
import type { User } from '@/types'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const authApi = {
  login(params: LoginParams) {
    return api.post<LoginResponse>('/auth/login', params)
  },

  logout() {
    return api.post('/auth/logout')
  },

  getCurrentUser() {
    return api.get<User>('/auth/me')
  }
}
