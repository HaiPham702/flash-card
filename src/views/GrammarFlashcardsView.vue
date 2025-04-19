<template>
  <div class="grammar-flashcards-view">
    <div class="container">
      <div class="flashcards-header">
        <router-link :to="backLink" class="back-link">
          <i class="fas fa-arrow-left"></i> Quay lại
        </router-link>
        <h1>{{ title }}</h1>
        <p class="flashcards-description">{{ description }}</p>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Đang tải thẻ ghi nhớ...</p>
      </div>

      <div v-else-if="cards.length === 0" class="no-cards">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Không có thẻ ghi nhớ</h2>
        <p>Hiện tại chưa có thẻ ghi nhớ cho chủ đề này. Vui lòng thử lại sau.</p>
        <router-link :to="backLink" class="back-button">
          Quay lại
        </router-link>
      </div>

      <div v-else class="flashcards-content">
        <div class="progress-info">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{width: `${(currentIndex + 1) / cards.length * 100}%`}"
            ></div>
          </div>
          <div class="card-counter">
            Thẻ {{ currentIndex + 1 }}/{{ cards.length }}
          </div>
        </div>

        <div class="flashcard-wrapper">
          <div 
            class="flashcard" 
            :class="{ 'flipped': isFlipped }" 
            @click="toggleFlip"
          >
            <div class="flashcard-face front">
              <div class="flashcard-content" v-html="currentCard.front">
              </div>
              <div class="flashcard-hint">
                <i class="fas fa-sync"></i> Nhấn để lật thẻ
              </div>
            </div>
            <div class="flashcard-face back">
              <div class="flashcard-content" v-html="currentCard.back">
              </div>
              <div v-if="currentCard.example" class="flashcard-example">
                <div class="example-text">{{ currentCard.example.text }}</div>
                <div class="example-translation">{{ currentCard.example.translation }}</div>
              </div>
              <div class="flashcard-hint">
                <i class="fas fa-sync"></i> Nhấn để lật thẻ
              </div>
            </div>
          </div>
        </div>

        <div class="flashcard-actions">
          <div class="nav-buttons">
            <button 
              class="prev-button" 
              @click="prevCard" 
              :disabled="currentIndex === 0"
            >
              <i class="fas fa-chevron-left"></i> Thẻ trước
            </button>
            <button 
              class="next-button" 
              @click="nextCard" 
              :disabled="currentIndex === cards.length - 1"
            >
              Thẻ sau <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <div class="difficulty-buttons">
            <p class="difficulty-label">Mức độ nắm bắt:</p>
            <div class="difficulty-options">
              <button 
                class="difficulty-button hard"
                @click="rateCard('hard')"
              >
                Khó
              </button>
              <button 
                class="difficulty-button medium"
                @click="rateCard('medium')"
              >
                Trung bình
              </button>
              <button 
                class="difficulty-button easy"
                @click="rateCard('easy')"
              >
                Dễ
              </button>
            </div>
          </div>
        </div>

        <div v-if="isLastCard" class="completion-notice">
          <i class="fas fa-check-circle"></i>
          <p>Bạn đã hoàn thành tất cả thẻ ghi nhớ!</p>
          <div class="completion-actions">
            <button @click="restartCards" class="restart-button">
              <i class="fas fa-redo"></i> Học lại
            </button>
            <router-link :to="backLink" class="back-button">
              <i class="fas fa-arrow-left"></i> Quay lại
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGrammarStore } from '@/stores/grammar'

interface FlashCard {
  id: string
  front: string
  back: string
  example?: {
    text: string
    translation: string
  }
  difficulty?: 'easy' | 'medium' | 'hard'
}

const route = useRoute()
const router = useRouter()
const grammarStore = useGrammarStore()

const loading = ref(true)
const cards = ref<FlashCard[]>([])
const currentIndex = ref(0)
const isFlipped = ref(false)

// Determine the source of flashcards
const dayId = computed(() => parseInt(route.params.dayId as string))

// Determine back link
const backLink = computed(() => `/grammar/topic/day-${dayId.value}`)

// Flashcards title and description
const title = computed(() => {
  if (loading.value) return 'Đang tải...'
  return `Thẻ ghi nhớ - Ngày ${dayId.value}`
})

const description = computed(() => {
  if (loading.value) return ''
  
  const day = grammarStore.grammarDays.find(d => d.id === dayId.value)
  return day 
    ? `Thẻ ghi nhớ về: ${day.topics.join(', ')}` 
    : 'Thẻ ghi nhớ ngữ pháp tiếng Anh'
})

const currentCard = computed(() => {
  if (cards.value.length === 0) {
    return { front: '', back: '' } as FlashCard
  }
  return cards.value[currentIndex.value]
})

const isLastCard = computed(() => {
  return currentIndex.value === cards.value.length - 1
})

// Actions
const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (currentIndex.value < cards.value.length - 1) {
    currentIndex.value++
    isFlipped.value = false
  }
}

const prevCard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    isFlipped.value = false
  }
}

const rateCard = (difficulty: 'easy' | 'medium' | 'hard') => {
  if (cards.value.length === 0) return
  
  // Save the difficulty rating
  cards.value[currentIndex.value].difficulty = difficulty
  
  // Move to the next card if not the last one
  if (currentIndex.value < cards.value.length - 1) {
    nextCard()
  }
}

const restartCards = () => {
  currentIndex.value = 0
  isFlipped.value = false
  
  // Could reset all difficulty ratings here if needed
  // cards.value.forEach(card => card.difficulty = undefined)
}

// Load flashcards
onMounted(async () => {
  loading.value = true
  
  try {
    // In a real app, you would fetch the flashcards from an API
    // For now, we'll use mock data
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const day = await grammarStore.fetchGrammarDay(dayId.value)
    
    if (day) {
      // Generate flashcards from the grammar day data
      const generatedCards: FlashCard[] = []
      
      // Topic cards
      day.topics.forEach((topic, index) => {
        generatedCards.push({
          id: `topic-${index}`,
          front: `Chủ đề: ${topic}`,
          back: day.explanation || 'Không có nội dung chi tiết.'
        })
      })
      
      // Example cards
      day.examples.forEach((example, index) => {
        generatedCards.push({
          id: `example-${index}`,
          front: 'Hoàn thành câu sau',
          back: example.text,
          example: {
            text: example.text,
            translation: example.translation
          }
        })
      })
      
      // Grammar rule cards - would be more in a real app
      // For now, we'll just add some mock cards
      generatedCards.push({
        id: 'rule-1',
        front: 'Định nghĩa ngữ pháp',
        back: 'Ngữ pháp trong tiếng Anh là tập hợp các quy tắc về cách sắp xếp từ và cấu trúc câu.'
      })
      
      if (day.level === 'basic') {
        generatedCards.push({
          id: 'rule-basic',
          front: 'Lưu ý về ngữ pháp cơ bản',
          back: 'Ngữ pháp cơ bản tập trung vào các quy tắc cơ bản của ngôn ngữ, là nền tảng cho việc học ngữ pháp nâng cao.'
        })
      }
      
      cards.value = generatedCards
    } else {
      // Fallback mock data if day not found
      cards.value = [
        {
          id: '1',
          front: 'Noun (Danh từ)',
          back: 'Danh từ là từ dùng để gọi tên người, vật, địa điểm hoặc khái niệm.',
          example: {
            text: 'She has a beautiful house.',
            translation: 'Cô ấy có một ngôi nhà đẹp.'
          }
        },
        {
          id: '2',
          front: 'Verb (Động từ)',
          back: 'Động từ là từ diễn tả hành động hoặc trạng thái.',
          example: {
            text: 'They are running in the park.',
            translation: 'Họ đang chạy trong công viên.'
          }
        },
        {
          id: '3',
          front: 'Adjective (Tính từ)',
          back: 'Tính từ là từ mô tả hoặc định rõ danh từ.',
          example: {
            text: 'This is an interesting book.',
            translation: 'Đây là một quyển sách thú vị.'
          }
        },
        {
          id: '4',
          front: 'Adverb (Trạng từ)',
          back: 'Trạng từ là từ mô tả động từ, tính từ, hoặc trạng từ khác.',
          example: {
            text: 'She speaks English fluently.',
            translation: 'Cô ấy nói tiếng Anh trôi chảy.'
          }
        },
        {
          id: '5',
          front: 'Preposition (Giới từ)',
          back: 'Giới từ là từ chỉ mối quan hệ giữa các từ trong câu.',
          example: {
            text: 'The book is on the table.',
            translation: 'Quyển sách ở trên bàn.'
          }
        }
      ]
    }
  } catch (error) {
    console.error('Error loading flashcards:', error)
    cards.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.grammar-flashcards-view {
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

.flashcards-header {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.back-link {
  position: absolute;
  left: 0;
  top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.flashcards-description {
  color: #6b7280;
  margin-top: 0.5rem;
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

.no-cards {
  text-align: center;
  padding: 3rem 0;
}

.no-cards i {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.no-cards h2 {
  margin-bottom: 0.5rem;
}

.no-cards p {
  margin-bottom: 1.5rem;
  color: #6b7280;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button:hover {
  background-color: #4f46e5;
}

.flashcards-content {
  max-width: 800px;
  margin: 0 auto;
}

.progress-info {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.card-counter {
  text-align: right;
  font-size: 0.9rem;
  color: #6b7280;
}

.flashcard-wrapper {
  perspective: 1000px;
  margin-bottom: 2rem;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 350px;
  margin: 0 auto;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  cursor: pointer;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.flashcard-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: autos;
}

.front {
  background-color: #eff6ff;
  border: 1px solid #93c5fd;
  color: #1e40af;
}

.back {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  transform: rotateY(180deg);
}

.flashcard-content {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.flashcard-example {
  margin-top: 1rem;
  font-size: 1rem;
  width: 100%;
}

.example-text {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.example-translation {
  font-style: italic;
  color: #6b7280;
}

.flashcard-hint {
  position: absolute;
  bottom: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flashcard-actions {
  margin-bottom: 2rem;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.prev-button,
.next-button {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.prev-button:hover,
.next-button:hover {
  background-color: #e5e7eb;
}

.prev-button:disabled,
.next-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.difficulty-buttons {
  margin-top: 1.5rem;
  text-align: center;
}

.difficulty-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.difficulty-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.difficulty-button {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  color: white;
}

.difficulty-button.hard {
  background-color: #ef4444;
}

.difficulty-button.hard:hover {
  background-color: #dc2626;
}

.difficulty-button.medium {
  background-color: #f59e0b;
}

.difficulty-button.medium:hover {
  background-color: #d97706;
}

.difficulty-button.easy {
  background-color: #10b981;
}

.difficulty-button.easy:hover {
  background-color: #059669;
}

.completion-notice {
  text-align: center;
  padding: 2rem;
  background-color: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #86efac;
  margin-top: 2rem;
}

.completion-notice i {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.completion-notice p {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.restart-button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #10b981;
  color: white;
  border: none;
}

.restart-button:hover {
  background-color: #059669;
}
</style> 