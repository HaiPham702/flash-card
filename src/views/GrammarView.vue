<template>
  <div class="grammar-view">
    <div class="header">
      <h1>Học ngữ pháp tiếng Anh</h1>
      <p class="subtitle">Lộ trình 35 ngày chinh phục ngữ pháp tiếng Anh</p>
    </div>

    <div class="container">
      <div class="tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'learning-path' }"
          @click="activeTab = 'learning-path'"
        >
          Lộ trình học
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'grammar-search' }"
          @click="activeTab = 'grammar-search'"
        >
          Tra cứu ngữ pháp
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'practice' }"
          @click="activeTab = 'practice'"
        >
          Bài tập luyện tập
        </button>
      </div>

      <!-- Learning Path Tab -->
      <div v-if="activeTab === 'learning-path'" class="learning-path">
        <div class="path-header">
          <h2>Lộ trình 35 ngày</h2>
          <div class="legend">
            <div class="legend-item">
              <div class="color-box basic"></div>
              <span>Ngữ pháp cơ bản</span>
            </div>
            <div class="legend-item">
              <div class="color-box intermediate"></div>
              <span>Ngữ pháp trung cấp</span>
            </div>
            <div class="legend-item">
              <div class="color-box advanced"></div>
              <span>Ngữ pháp nâng cao</span>
            </div>
            <div class="legend-item">
              <div class="color-box review"></div>
              <span>Review/Minitest/Final test</span>
            </div>
          </div>
        </div>

        <!-- Days 1-12 -->
        <div class="learning-path-section">
          <div v-for="day in grammarData.slice(0, 12)" :key="day.id" 
            class="day-card" 
            :class="[day.level, { 'completed': isCompleted(day.id) }]"
            @click="openDayDetails(day.id)">
            <div class="day-header">
              <span class="day-number">{{ day.id }}</span>
              <div v-if="isCompleted(day.id)" class="completed-icon">✓</div>
            </div>
            <div class="day-content">
              <h3>{{ day.title }}</h3>
              <ul class="topic-list">
                <li v-for="(topic, index) in day.topics" :key="index">{{ topic }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Days 13-24 -->
        <div class="learning-path-section">
          <div v-for="day in grammarData.slice(12, 24)" :key="day.id" 
            class="day-card" 
            :class="[day.level, { 'completed': isCompleted(day.id) }]"
            @click="openDayDetails(day.id)">
            <div class="day-header">
              <span class="day-number">{{ day.id }}</span>
              <div v-if="isCompleted(day.id)" class="completed-icon">✓</div>
            </div>
            <div class="day-content">
              <h3>{{ day.title }}</h3>
              <ul class="topic-list">
                <li v-for="(topic, index) in day.topics" :key="index">{{ topic }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Days 25-35 -->
        <div class="learning-path-section">
          <div v-for="day in grammarData.slice(24, 35)" :key="day.id" 
            class="day-card" 
            :class="[day.level, { 'completed': isCompleted(day.id) }]"
            @click="openDayDetails(day.id)">
            <div class="day-header">
              <span class="day-number">{{ day.id }}</span>
              <div v-if="isCompleted(day.id)" class="completed-icon">✓</div>
            </div>
            <div class="day-content">
              <h3>{{ day.title }}</h3>
              <ul class="topic-list">
                <li v-for="(topic, index) in day.topics" :key="index">{{ topic }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Grammar Search Tab -->
      <div v-if="activeTab === 'grammar-search'" class="grammar-search">
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm kiếm chủ đề ngữ pháp..."
            class="search-input"
          />
          <button class="search-button" @click="searchGrammar">
            <i class="fas fa-search"></i> Tìm kiếm
          </button>
        </div>

        <div class="search-results">
          <div v-if="searchResults.length > 0">
            <div 
              v-for="(result, index) in searchResults" 
              :key="index" 
              class="search-result-item"
              @click="openGrammarTopic(result.id)"
            >
              <h3>{{ result.title }}</h3>
              <p>{{ result.description }}</p>
            </div>
          </div>
          <div v-else-if="searchQuery && searchResults.length === 0" class="no-results">
            <p>Không tìm thấy kết quả cho "{{ searchQuery }}"</p>
          </div>
          <div v-else class="popular-topics">
            <h3>Chủ đề phổ biến</h3>
            <div class="topics-grid">
              <div 
                v-for="(topic, index) in popularTopics" 
                :key="index" 
                class="topic-card"
                @click="openGrammarTopic(topic.id)"
              >
                <h4>{{ topic.title }}</h4>
                <p>{{ topic.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Practice Tab -->
      <div v-if="activeTab === 'practice'" class="practice-section">
        <h2>Bài tập luyện tập</h2>
        <div class="practice-categories">
          <div 
            v-for="(category, index) in practiceCategories" 
            :key="index" 
            class="practice-category"
            @click="openPracticeCategory(category.id)"
          >
            <div class="category-icon">
              <i :class="category.icon"></i>
            </div>
            <h3>{{ category.title }}</h3>
            <p>{{ category.description }}</p>
            <span class="practice-count">{{ category.exerciseCount }} bài tập</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Details Modal -->
    <div v-if="selectedDay" class="modal-overlay">
      <div class="modal day-details-modal">
        <div class="modal-header">
          <h2>Ngày {{ selectedDay.id }}: {{ selectedDay.title }}</h2>
          <button class="close-button" @click="selectedDay = null">×</button>
        </div>
        <div class="modal-content">
          <div class="day-detail-content">
            <h3>Chủ đề học</h3>
            <ul class="detail-topic-list">
              <li v-for="(topic, index) in selectedDay.topics" :key="index">{{ topic }}</li>
            </ul>

            <div class="grammar-explanation" v-if="selectedDay.explanation">
              <h3>Giải thích</h3>
              <div v-html="selectedDay.explanation"></div>
            </div>

            <div class="grammar-examples" v-if="selectedDay.examples && selectedDay.examples.length">
              <h3>Ví dụ</h3>
              <div class="example-card" v-for="(example, i) in selectedDay.examples" :key="i">
                <div class="example-text">{{ example.text }}</div>
                <div class="example-translation">{{ example.translation }}</div>
                <div class="example-explanation" v-if="example.explanation">{{ example.explanation }}</div>
              </div>
            </div>

            <div class="action-buttons">
              <button class="practice-button" @click="startPractice(selectedDay.id)">
                Làm bài tập
              </button>
              <button class="study-cards-button" @click="studyFlashcards(selectedDay.id)">
                Học thẻ ghi nhớ
              </button>
              <button 
                class="mark-completed-button" 
                @click="toggleCompleted(selectedDay.id)"
                :class="{ 'completed': isCompleted(selectedDay.id) }"
              >
                {{ isCompleted(selectedDay.id) ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGrammarStore } from '@/stores/grammar'
import { useRouter } from 'vue-router'

const router = useRouter()
const grammarStore = useGrammarStore()

const activeTab = ref('learning-path')
const searchQuery = ref('')
const selectedDay = ref(null)
const completedDays = ref<number[]>([])

// Fetch grammar data from the store
const grammarData = computed(() => grammarStore.grammarDays)
const searchResults = ref([])
const popularTopics = ref([
  { id: 'nouns', title: 'Danh từ', description: 'Các loại danh từ và cách sử dụng' },
  { id: 'verbs', title: 'Động từ', description: 'Thì, thể, cách chia động từ' },
  { id: 'articles', title: 'Mạo từ', description: 'A, an, và the' },
  { id: 'adjectives', title: 'Tính từ', description: 'Vị trí và cách sử dụng tính từ' },
  { id: 'conditionals', title: 'Câu điều kiện', description: 'Các loại câu điều kiện' },
  { id: 'prepositions', title: 'Giới từ', description: 'Các giới từ và cách dùng' }
])

const practiceCategories = ref([
  { 
    id: 'multiple-choice', 
    title: 'Trắc nghiệm', 
    description: 'Luyện tập với các câu hỏi trắc nghiệm',
    icon: 'fas fa-check-circle',
    exerciseCount: 120
  },
  { 
    id: 'fill-blanks', 
    title: 'Điền vào chỗ trống', 
    description: 'Hoàn thành câu với từ đúng ngữ pháp',
    icon: 'fas fa-pencil-alt',
    exerciseCount: 85
  },
  { 
    id: 'error-correction', 
    title: 'Sửa lỗi', 
    description: 'Tìm và sửa lỗi ngữ pháp trong câu',
    icon: 'fas fa-exclamation-triangle',
    exerciseCount: 65
  },
  { 
    id: 'sentence-transformation', 
    title: 'Chuyển đổi câu', 
    description: 'Viết lại câu với cấu trúc khác nhưng giữ nguyên nghĩa',
    icon: 'fas fa-exchange-alt',
    exerciseCount: 50
  }
])

onMounted(async () => {
  // Load the grammar data
  await grammarStore.fetchGrammarDays()
  
  // Load completed days from local storage
  const savedCompletedDays = localStorage.getItem('completedGrammarDays')
  if (savedCompletedDays) {
    completedDays.value = JSON.parse(savedCompletedDays)
  }
})

const searchGrammar = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  // Filter grammar topics based on search query
  searchResults.value = grammarStore.searchGrammarTopics(searchQuery.value)
}

const openDayDetails = (dayId: number) => {
  const day = grammarData.value.find(d => d.id === dayId)
  if (day) {
    selectedDay.value = day
  }
}

const openGrammarTopic = (topicId: string) => {
  console.log('Opening grammar topic:', topicId)
  // Navigate to the detailed grammar topic page
  router.push(`/grammar/topic/${topicId}`)
}

const openPracticeCategory = (categoryId: string) => {
  console.log('Opening practice category:', categoryId)
  // Navigate to the practice category page
  router.push(`/grammar/practice/${categoryId}`)
}

const startPractice = (dayId: number) => {
  console.log('Starting practice for day:', dayId)
  // Navigate to the practice page for this day
  router.push(`/grammar/practice/day/${dayId}`)
}

const studyFlashcards = (dayId: number) => {
  console.log('Studying flashcards for day:', dayId)
  // Navigate to the flashcards page for this day
  router.push(`/grammar/flashcards/${dayId}`)
}

const isCompleted = (dayId: number) => {
  return completedDays.value.includes(dayId)
}

const toggleCompleted = (dayId: number) => {
  const index = completedDays.value.indexOf(dayId)
  if (index === -1) {
    completedDays.value.push(dayId)
  } else {
    completedDays.value.splice(index, 1)
  }
  
  // Save to local storage
  localStorage.setItem('completedGrammarDays', JSON.stringify(completedDays.value))
}
</script>

<style scoped>
.grammar-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.tab-button {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.tab-button:hover {
  background-color: #f3f4f6;
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
  background-color: white;
}

/* Learning Path Styles */
.learning-path {
  padding: 1.5rem;
}

.path-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.color-box.basic {
  background-color: #fef3c7;
}

.color-box.intermediate {
  background-color: #fdba74;
}

.color-box.advanced {
  background-color: #2563eb;
}

.color-box.review {
  background-color: #334155;
}

.learning-path-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.day-card {
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
  height: 100%;
}

.day-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-card.basic {
  background-color: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.day-card.intermediate {
  background-color: #fdba74;
  border-left: 4px solid #ea580c;
}

.day-card.advanced {
  background-color: #93c5fd;
  border-left: 4px solid #2563eb;
  color: #1e40af;
}

.day-card.review {
  background-color: #cbd5e1;
  border-left: 4px solid #334155;
  color: #0f172a;
}

.day-card.completed::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 30px 0;
  border-color: transparent #10b981 transparent transparent;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.day-number {
  font-size: 1.25rem;
  font-weight: 700;
}

.completed-icon {
  background-color: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.day-content h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.topic-list {
  list-style-type: disc;
  padding-left: 1.25rem;
  font-size: 0.9rem;
}

.topic-list li {
  margin-bottom: 0.25rem;
}

/* Grammar Search Styles */
.grammar-search {
  padding: 1.5rem;
}

.search-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
}

.search-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #4f46e5;
}

.search-result-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.search-result-item:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.search-result-item h3 {
  margin-bottom: 0.5rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.popular-topics h3 {
  margin-bottom: 1rem;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.topic-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.topic-card:hover {
  background-color: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.topic-card h4 {
  margin-bottom: 0.5rem;
}

/* Practice Section Styles */
.practice-section {
  padding: 1.5rem;
}

.practice-section h2 {
  margin-bottom: 1.5rem;
}

.practice-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.practice-category {
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.practice-category:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-icon {
  margin-bottom: 1rem;
  font-size: 2rem;
  color: var(--primary-color);
}

.practice-category h3 {
  margin-bottom: 0.5rem;
}

.practice-category p {
  color: #6b7280;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.practice-count {
  font-size: 0.8rem;
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-content {
  padding: 1.5rem;
}

.day-details-modal .modal-content {
  padding-top: 0;
}

.day-detail-content h3 {
  margin: 1.5rem 0 0.75rem 0;
}

.detail-topic-list {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.grammar-explanation {
  margin-bottom: 1.5rem;
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

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.practice-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.practice-button:hover {
  background-color: #4f46e5;
}

.study-cards-button {
  background-color: white;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.study-cards-button:hover {
  background-color: #f3f4f6;
}

.mark-completed-button {
  background-color: #10b981;
  border: none;
  color: white;
}

.mark-completed-button:hover {
  background-color: #059669;
}

.mark-completed-button.completed {
  background-color: #f43f5e;
}

.mark-completed-button.completed:hover {
  background-color: #e11d48;
}
</style> 