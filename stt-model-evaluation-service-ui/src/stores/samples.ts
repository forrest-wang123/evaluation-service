import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Sample, SampleFilter } from '@/types'
import { sampleApi } from '@/api/samples'

export const useSampleStore = defineStore('samples', () => {
  const samples = ref<Sample[]>([])
  const currentSample = ref<Sample | null>(null)
  const total = ref(0)
  const loading = ref(false)

  async function fetchSamples(page = 1, pageSize = 20, filter?: SampleFilter) {
    loading.value = true
    try {
      const response = await sampleApi.getSamples({ page, pageSize, filter })
      samples.value = response.items
      total.value = response.total
    } finally {
      loading.value = false
    }
  }

  async function fetchSample(id: string) {
    loading.value = true
    try {
      currentSample.value = await sampleApi.getSample(id)
    } finally {
      loading.value = false
    }
  }

  async function uploadSample(params: Parameters<typeof sampleApi.uploadSample>[0]) {
    return await sampleApi.uploadSample(params)
  }

  async function updateSample(id: string, data: Partial<Sample>) {
    return await sampleApi.updateSample(id, data)
  }

  async function deleteSample(id: string) {
    await sampleApi.deleteSample(id)
    samples.value = samples.value.filter(s => s.id !== id)
  }

  return {
    samples,
    currentSample,
    total,
    loading,
    fetchSamples,
    fetchSample,
    uploadSample,
    updateSample,
    deleteSample
  }
})
