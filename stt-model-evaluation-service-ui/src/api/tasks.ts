import api from './index'
import type { TestTask, TaskExecutionLog, TestResult, InstantTest, PaginatedResponse } from '@/types'

export const taskApi = {
  // Get task list
  getTasks(params?: { page?: number; pageSize?: number; status?: string }) {
    return api.get<PaginatedResponse<TestTask>>('/tasks', { params })
  },

  // Get task by id
  getTask(id: string) {
    return api.get<TestTask>(`/tasks/${id}`)
  },

  // Create task
  createTask(data: Omit<TestTask, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    return api.post<TestTask>('/tasks', data)
  },

  // Update task
  updateTask(id: string, data: Partial<TestTask>) {
    return api.put<TestTask>(`/tasks/${id}`, data)
  },

  // Delete task
  deleteTask(id: string) {
    return api.delete(`/tasks/${id}`)
  },

  // Start task
  startTask(id: string) {
    return api.post(`/tasks/${id}/start`)
  },

  // Pause task
  pauseTask(id: string) {
    return api.post(`/tasks/${id}/pause`)
  },

  // Resume task
  resumeTask(id: string) {
    return api.post(`/tasks/${id}/resume`)
  },

  // Cancel task
  cancelTask(id: string) {
    return api.post(`/tasks/${id}/cancel`)
  },

  // Get task logs
  getTaskLogs(id: string, params?: { page?: number; pageSize?: number }) {
    return api.get<PaginatedResponse<TaskExecutionLog>>(`/tasks/${id}/logs`, { params })
  },

  // Get task results
  getTaskResults(id: string, params?: { page?: number; pageSize?: number }) {
    return api.get<PaginatedResponse<TestResult>>(`/tasks/${id}/results`, { params })
  },

  // Instant test
  instantTest(data: { audioFile: File; modelId: string }) {
    const formData = new FormData()
    formData.append('audioFile', data.audioFile)
    formData.append('modelId', data.modelId)
    return api.post<InstantTest>('/tasks/instant-test', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
