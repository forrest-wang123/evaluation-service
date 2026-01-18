import api from './index'
import type { Sample, SampleUploadParams, SampleFilter, PaginatedResponse } from '@/types'

export const sampleApi = {
  // Get sample list
  getSamples(params: { page?: number; pageSize?: number; filter?: SampleFilter }) {
    return api.get<PaginatedResponse<Sample>>('/samples', { params })
  },

  // Get sample by id
  getSample(id: string) {
    return api.get<Sample>(`/samples/${id}`)
  },

  // Upload sample
  uploadSample(params: SampleUploadParams) {
    const formData = new FormData()
    formData.append('file', params.file)
    formData.append('name', params.name)
    formData.append('industry', params.industry)
    formData.append('scenario', params.scenario)
    formData.append('noiseLevel', params.noiseLevel)
    if (params.playbackParams) {
      formData.append('playbackParams', JSON.stringify(params.playbackParams))
    }
    return api.post<Sample>('/samples/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Update sample
  updateSample(id: string, data: Partial<Sample>) {
    return api.put<Sample>(`/samples/${id}`, data)
  },

  // Delete sample
  deleteSample(id: string) {
    return api.delete(`/samples/${id}`)
  },

  // Batch import
  batchImport(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<{ success: number; failed: number }>('/samples/batch-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Batch export
  batchExport(filter?: SampleFilter) {
    return api.get('/samples/batch-export', {
      params: filter,
      responseType: 'blob'
    })
  }
}
