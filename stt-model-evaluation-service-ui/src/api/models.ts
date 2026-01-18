import api from './index'
import type { Model, ModelGroup, PaginatedResponse } from '@/types'

export const modelApi = {
  // Get model list
  getModels(params?: { page?: number; pageSize?: number; vendor?: string }) {
    return api.get<PaginatedResponse<Model>>('/models', { params })
  },

  // Get model by id
  getModel(id: string) {
    return api.get<Model>(`/models/${id}`)
  },

  // Create model
  createModel(data: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>) {
    return api.post<Model>('/models', data)
  },

  // Update model
  updateModel(id: string, data: Partial<Model>) {
    return api.put<Model>(`/models/${id}`, data)
  },

  // Delete model
  deleteModel(id: string) {
    return api.delete(`/models/${id}`)
  },

  // Test connection
  testConnection(id: string) {
    return api.post<{ success: boolean; message?: string }>(`/models/${id}/test`)
  },

  // Get model groups
  getModelGroups() {
    return api.get<ModelGroup[]>('/models/groups')
  },

  // Create model group
  createModelGroup(data: Omit<ModelGroup, 'id' | 'createdAt'>) {
    return api.post<ModelGroup>('/models/groups', data)
  }
}
