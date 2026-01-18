import api from './index'
import type { User, Project, Team, AuditLog, SystemConfig, PaginatedResponse } from '@/types'

export const systemApi = {
  // User management
  getUsers(params?: { page?: number; pageSize?: number }) {
    return api.get<PaginatedResponse<User>>('/system/users', { params })
  },

  createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return api.post<User>('/system/users', data)
  },

  updateUser(id: string, data: Partial<User>) {
    return api.put<User>(`/system/users/${id}`, data)
  },

  deleteUser(id: string) {
    return api.delete(`/system/users/${id}`)
  },

  // Project management
  getProjects() {
    return api.get<Project[]>('/system/projects')
  },

  createProject(data: Omit<Project, 'id' | 'createdAt'>) {
    return api.post<Project>('/system/projects', data)
  },

  // Team management
  getTeams() {
    return api.get<Team[]>('/system/teams')
  },

  createTeam(data: Omit<Team, 'id' | 'createdAt'>) {
    return api.post<Team>('/system/teams', data)
  },

  // Audit logs
  getAuditLogs(params?: { page?: number; pageSize?: number; userId?: string }) {
    return api.get<PaginatedResponse<AuditLog>>('/system/audit-logs', { params })
  },

  // System config
  getSystemConfig() {
    return api.get<SystemConfig>('/system/config')
  },

  updateSystemConfig(data: Partial<SystemConfig>) {
    return api.put<SystemConfig>('/system/config', data)
  }
}
