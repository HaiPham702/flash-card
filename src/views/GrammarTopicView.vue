<template>
  <div class="grammar-topic-view">
    <div class="container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Đang tải nội dung...</p>
      </div>

      <div v-else-if="topic" class="topic-content">
        <div class="topic-header">
          <router-link to="/grammar" class="back-link">
            <i class="fas fa-arrow-left"></i> Quay lại lộ trình
          </router-link>
          <h1>{{ topic.title }}</h1>
          <p class="topic-description">{{ topic.description }}</p>
        </div>

        <div class="topic-body" v-if="topic.content" v-html="topic.content"></div>

        <div class="topic-examples" v-if="examples.length > 0">
          <h2>Ví dụ minh họa</h2>
          <div class="example-card" v-for="(example, index) in examples" :key="index">
            <div class="example-text">{{ example.text }}</div>
            <div class="example-translation">{{ example.translation }}</div>
            <div class="example-explanation" v-if="example.explanation">{{ example.explanation }}</div>
          </div>
        </div>

        <div class="practice-section">
          <h2>Luyện tập</h2>
          <div class="practice-buttons">
            <button class="practice-button" @click="startPractice">
              <i class="fas fa-tasks"></i> Làm bài tập
            </button>
            <button class="flashcards-button" @click="studyFlashcards">
              <i class="fas fa-clone"></i> Học thẻ ghi nhớ
            </button>
          </div>
        </div>

        <div class="related-topics" v-if="relatedTopics.length > 0">
          <h2>Chủ đề liên quan</h2>
          <div class="related-topics-grid">
            <div 
              v-for="(related, index) in relatedTopics" 
              :key="index"
              class="related-topic-card"
              @click="navigateToTopic(related.id)"
            >
              <h3>{{ related.title }}</h3>
              <p>{{ related.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="not-found">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Không tìm thấy chủ đề</h2>
        <p>Chủ đề bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <router-link to="/grammar" class="back-button">
          Quay lại trang ngữ pháp
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGrammarStore } from '@/stores/grammar'
import type { GrammarTopic, GrammarExample } from '@/types/grammar'

const route = useRoute()
const router = useRouter()
const grammarStore = useGrammarStore()

const topicId = computed(() => route.params.topicId as string)
const topic = ref<GrammarTopic | null>(null)
const examples = ref<GrammarExample[]>([])
const relatedTopics = ref<{id: string, title: string, description: string}[]>([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    // If topicId starts with "day-", it's a grammar day
    if (topicId.value.startsWith('day-')) {
      const dayId = parseInt(topicId.value.replace('day-', ''))
      const day = await grammarStore.fetchGrammarDay(dayId)
      
      if (day) {
        topic.value = {
          id: topicId.value,
          title: day.title,
          description: day.topics.join(', '),
          content: day.explanation
        }
        examples.value = day.examples
      }
    } else {
      // In a real app, you would fetch the topic data from the API
      // For now we'll just show some dummy data
      topic.value = {
        id: topicId.value,
        title: 'Sample Grammar Topic',
        description: 'This is a sample grammar topic for demonstration',
        content: `
          <p>This is a placeholder for the actual grammar content.</p>
          <p>In a real application, this would contain detailed explanations about the grammar topic.</p>
          <h3>Rules</h3>
          <ul>
            <li>Rule 1: Example of the first rule</li>
            <li>Rule 2: Example of the second rule</li>
            <li>Rule 3: Example of the third rule</li>
          </ul>
        `
      }
      
      examples.value = [
        {
          text: "This is an example sentence.",
          translation: "Đây là một câu ví dụ.",
          explanation: "This example demonstrates the grammar rule."
        },
        {
          text: "Another example to illustrate the point.",
          translation: "Một ví dụ khác để minh họa điểm này.",
          explanation: "This shows another aspect of the grammar rule."
        }
      ]
      
      relatedTopics.value = [
        {
          id: 'related-topic-1',
          title: 'Related Grammar Topic 1',
          description: 'A related grammar topic that might be helpful'
        },
        {
          id: 'related-topic-2',
          title: 'Related Grammar Topic 2',
          description: 'Another related grammar topic to explore'
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching grammar topic:', error)
    topic.value = null
  } finally {
    loading.value = false
  }
})

const startPractice = () => {
  if (topicId.value.startsWith('day-')) {
    const dayId = parseInt(topicId.value.replace('day-', ''))
    router.push(`/grammar/practice/day/${dayId}`)
  } else {
    router.push(`/grammar/practice/topic/${topicId.value}`)
  }
}

const studyFlashcards = () => {
  if (topicId.value.startsWith('day-')) {
    const dayId = parseInt(topicId.value.replace('day-', ''))
    router.push(`/grammar/flashcards/${dayId}`)
  } else {
    router.push(`/grammar/flashcards/topic/${topicId.value}`)
  }
}

const navigateToTopic = (id: string) => {
  router.push(`/grammar/topic/${id}`)
}
</script>

<style scoped>
.grammar-topic-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 2rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.topic-header {
  margin-bottom: 2rem;
  position: relative;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  margin-bottom: 1rem;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.topic-description {
  color: #6b7280;
  margin-top: 0.5rem;
  font-size: 1.1rem;
}

.topic-body {
  margin-bottom: 2rem;
  line-height: 1.7;
}

.topic-body h3 {
  margin: 1.5rem 0 0.75rem;
}

.topic-body ul {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.topic-body li {
  margin-bottom: 0.5rem;
}

.topic-examples {
  margin-bottom: 2rem;
}

.topic-examples h2 {
  margin-bottom: 1rem;
}

.example-card {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 3px solid var(--primary-color);
}

.example-text {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.example-translation {
  color: #6b7280;
  font-style: italic;
  margin-bottom: 0.5rem;
}

.example-explanation {
  font-size: 0.9rem;
  color: #4b5563;
}

.practice-section {
  margin-bottom: 2rem;
}

.practice-section h2 {
  margin-bottom: 1rem;
}

.practice-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.practice-button,
.flashcards-button {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.practice-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.practice-button:hover {
  background-color: #4f46e5;
}

.flashcards-button {
  background-color: white;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.flashcards-button:hover {
  background-color: #f3f4f6;
}

.related-topics {
  margin-top: 3rem;
}

.related-topics h2 {
  margin-bottom: 1rem;
}

.related-topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.related-topic-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.related-topic-card:hover {
  background-color: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.related-topic-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.related-topic-card p {
  font-size: 0.9rem;
  color: #6b7280;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 0;
}

.not-found i {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.not-found h2 {
  margin-bottom: 0.5rem;
}

.not-found p {
  margin-bottom: 1.5rem;
  color: #6b7280;
}

.back-button {
  padding: 0.75rem 1.25rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
}

.back-button:hover {
  background-color: #4f46e5;
}
</style> 