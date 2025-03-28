import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SpeakingTopic } from '@/types/speaking'
import { apiRequest } from '@/api'


export const useSpeakingStore = defineStore('speaking', () => {
  const currentTopic = ref<SpeakingTopic | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchTodayTopic = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Nếu chưa có server, sử dụng dữ liệu mẫu

      // TODO: Uncomment khi có server
      if (!currentTopic.value) {
        const response = await apiRequest('/speaking/today')
        currentTopic.value = response
        return response
      }

      return currentTopic.value
    } catch (err) {
      error.value = 'Không thể tải chủ đề speaking'
      console.error('Error fetching today topic:', err)
    } finally {
      isLoading.value = false
    }
  }

  const generateNewTopic = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiRequest('/speaking/generate', 'POST')
      currentTopic.value = response
    } catch (err) {
      error.value = 'Không thể tạo chủ đề speaking mới'
      console.error('Error generating new topic:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentTopic,
    isLoading,
    error,
    fetchTodayTopic,
    generateNewTopic
  }
}) 