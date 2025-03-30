<template>
  <div class="daily-speaking-card">
    <div class="card-header">
      <h3>
        <i class="fas fa-microphone"></i>
        Speaking Topics Hôm Nay
      </h3>
      <router-link to="/speaking" class="view-all-link">
        Xem chi tiết
        <i class="fas fa-arrow-right"></i>
      </router-link>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Đang tải chủ đề speaking...</p>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="currentTopic" class="topic-preview">
      <div class="part-preview">
        <h4>Part 1</h4>
        <ul>
          <li v-for="(question, index) in currentTopic.part1.questions.slice(0, 2)" :key="index">
            {{ question }}
          </li>
        </ul>
      </div>

      <div class="part-preview">
        <h4>Part 2</h4>
        <p class="topic-title">{{ currentTopic.part2.topic }}</p>
      </div>

      <div class="part-preview">
        <h4>Part 3</h4>
        <ul>
          <li v-for="(question, index) in currentTopic.part3.questions.slice(0, 2)" :key="index">
            {{ question }}
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Chưa có chủ đề speaking cho ngày hôm nay</p>
      <button @click="generateNewTopic" class="generate-button">
        <i class="fas fa-magic"></i> Tạo chủ đề mới
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSpeakingStore } from '@/stores/speaking'
import type { SpeakingTopic } from '@/types/speaking'

const store = useSpeakingStore()
const { currentTopic: currentTopicStore, isLoading: storeLoading, error, fetchTodayTopic, generateNewTopic } = store
const currentTopic = ref<SpeakingTopic | null>(null)
const isLoading = ref(false)

onMounted(async () => {
  if (!currentTopicStore) {
    isLoading.value = true
    try {
      currentTopic.value = await fetchTodayTopic()
    } finally {
      isLoading.value = false
    }
  } else {
    currentTopic.value = currentTopicStore
  }
})
</script>

<style scoped>
.daily-speaking-card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  color: #1f2937;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header h3 i {
  color: #6366f1;
}

.view-all-link {
  color: #6366f1;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #4f46e5;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-content p {
  color: #4b5563;
  font-size: 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
}

.topic-preview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.part-preview {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
}

.part-preview h4 {
  color: #4b5563;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.topic-title {
  color: #1f2937;
  font-weight: 500;
  margin: 0;
}

.part-preview ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.part-preview li {
  color: #4b5563;
  font-size: 0.875rem;
  padding-left: 1.5rem;
  position: relative;
}

.part-preview li::before {
  content: "•";
  color: #6366f1;
  position: absolute;
  left: 0;
}

.empty-state {
  text-align: center;
  padding: 2rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.generate-button {
  padding: 0.5rem 1rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.generate-button:hover {
  background-color: #4f46e5;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>