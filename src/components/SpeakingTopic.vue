<template>
  <div class="speaking-topic">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Đang tải chủ đề speaking...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchTodayTopic" class="retry-button">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="currentTopic" class="topic-content">
      <div class="topic-header">
        <h2>Chủ đề Speaking ngày {{ formatDate(currentTopic.date) }}</h2>
      </div>

      <div class="topic-sections">
        <!-- Part 1 -->
        <div class="topic-section">
          <h3>Part 1</h3>
          <div class="questions-list">
            <div v-for="(question, index) in currentTopic.part1.questions" :key="index" class="question-item">
              <span class="question-number">{{ index + 1 }}</span>
              <p>{{ question }}</p>
            </div>
          </div>
        </div>

        <!-- Part 2 -->
        <div class="topic-section">
          <h3>Part 2</h3>
          <div class="part2-topic">
            <h4>Chủ đề:</h4>
            <p>{{ currentTopic.part2.topic }}</p>
          </div>
          <div class="follow-up-questions">
            <h4>Câu hỏi phụ:</h4>
            <div class="questions-list">
              <div v-for="(question, index) in currentTopic.part2.followUpQuestions" :key="index" class="question-item">
                <span class="question-number">{{ index + 1 }}</span>
                <p>{{ question }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Part 3 -->
        <div class="topic-section">
          <h3>Part 3</h3>
          <div class="questions-list">
            <div v-for="(question, index) in currentTopic.part3.questions" :key="index" class="question-item">
              <span class="question-number">{{ index + 1 }}</span>
              <p>{{ question }}</p>
            </div>
          </div>
        </div>
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
const { currentTopic: currentTopicStore, isLoading, error, fetchTodayTopic, generateNewTopic } = store
const currentTopic = ref<SpeakingTopic | null>(null)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

fetchTodayTopic()

onMounted(async () => {
  currentTopic.value = currentTopicStore ? currentTopicStore : await fetchTodayTopic()
})
</script>

<style scoped>
.speaking-topic {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-state p,
.empty-state p {
  color: #666;
  margin-bottom: 1rem;
}

.retry-button,
.generate-button {
  padding: 0.75rem 1.5rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-button:hover,
.generate-button:hover {
  background-color: #4f46e5;
}

.topic-content {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 2rem;
}

.topic-header {
  margin-bottom: 2rem;
  text-align: center;
}

.topic-header h2 {
  color: #374151;
  font-size: 1.5rem;
}

.topic-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.topic-section {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.topic-section h3 {
  color: #1f2937;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.part2-topic {
  margin-bottom: 1.5rem;
}

.part2-topic h4,
.follow-up-questions h4 {
  color: #4b5563;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.question-number {
  background-color: #6366f1;
  color: white;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  flex-shrink: 0;
}

.question-item p {
  color: #374151;
  line-height: 1.5;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>