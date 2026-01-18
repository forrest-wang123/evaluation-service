import api from './index'
import type { EvaluationReport, PaginatedResponse } from '@/types'

export const reportApi = {
  // Get report list
  getReports(params?: { page?: number; pageSize?: number; taskId?: string }) {
    return api.get<PaginatedResponse<EvaluationReport>>('/reports', { params })
  },

  // Get report by id
  getReport(id: string) {
    return api.get<EvaluationReport>(`/reports/${id}`)
  },

  // Export report as PDF
  exportPDF(id: string) {
    return api.get(`/reports/${id}/export/pdf`, {
      responseType: 'blob'
    })
  },

  // Export report as Excel
  exportExcel(id: string) {
    return api.get(`/reports/${id}/export/excel`, {
      responseType: 'blob'
    })
  },

  // Get report share link
  getShareLink(id: string) {
    return api.post<{ link: string; expiresAt: string }>(`/reports/${id}/share`)
  },

  // Compare reports
  compareReports(reportIds: string[]) {
    return api.post<EvaluationReport[]>('/reports/compare', { reportIds })
  }
}
