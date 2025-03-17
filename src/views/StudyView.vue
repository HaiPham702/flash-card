<template>
  <div class="study-view">
    <div class="header">
      <h1>{{ deck?.name }}</h1>
      <div class="header-actions">
        <router-link :to="'/test/' + deckId" class="test-button">
          <i class="fas fa-pencil-alt"></i> Làm bài kiểm tra
        </router-link>
        <router-link :to="'/deck/' + deckId" class="edit-button">
          <i class="fas fa-edit"></i> Chỉnh sửa bộ thẻ
        </router-link>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <template v-else-if="deck">
      <div class="progress">
        <span>{{ currentCardIndex + 1 }}/{{ deck.cards.length }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${((currentCardIndex + 1) / deck.cards.length) * 100}%` }">
          </div>
        </div>
      </div>

      <div v-if="currentCard" class="card-container">
        <div class="flashcard" :class="{ flipped: showAnswer }" @click="showAnswer = !showAnswer">
          <div class="card-face front">
            <button class="speak-button" @click.stop="speakText(currentCard.front)">
              <i class="fas fa-volume-up"></i>
            </button>
            <div class="card-content">
              <div class="content-wrapper">
                <p>{{ currentCard.front }}</p>
                <img v-if="currentCard.image" :src="currentCard.image" alt="Card image" class="card-image">
              </div>
            </div>
            <div class="card-hint">
              Click để xem đáp án
            </div>
          </div>
          <div class="card-face back">
            <button class="speak-button" @click.stop="speakText(currentCard.back)">
              <i class="fas fa-volume-up"></i>
            </button>
            <div class="card-content">
              {{ currentCard.back }}
            </div>
            <div class="rating-buttons" @click.stop>
              <button v-for="rating in ratings" :key="rating.value" @click="rateCard(rating.value)"
                :class="rating.class">
                {{ rating.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="completion-message">
        <h2>🎉 Chúc mừng!</h2>
        <p>Bạn đã hoàn thành phiên học tập này.</p>
        <div class="completion-actions">
          <router-link :to="'/deck/' + deckId" class="back-button">
            Quay lại bộ thẻ
          </router-link>
          <button @click="restartStudy" class="restart-button">
            Học lại
          </button>
        </div>
      </div>
    </template>

    <div v-else class="error-state">
      <p>Không tìm thấy bộ thẻ này</p>
      <router-link to="/" class="back-button">Quay lại trang chủ</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeckStore } from '@/stores/deck'

interface Card {
  _id: string
  front: string
  back: string
  image?: string
  lastReview?: Date
  nextReview?: Date
  level: number
}

interface Deck {
  _id: string
  name: string
  cards: Card[]
}

const route = useRoute()
const router = useRouter()
const store = useDeckStore()
const deckId = route.params.deckId

const isLoading = ref(true)
const deck = ref<Deck | null>(null)
const currentCardIndex = ref(0)
const showAnswer = ref(false)

const currentCard = computed(() => {
  if (!deck.value) return null
  return currentCardIndex.value < deck.value.cards.length
    ? deck.value.cards[currentCardIndex.value]
    : null
})

const ratings = [
  { value: 1, label: 'Khó nhớ', class: 'rating-hard' },
  { value: 2, label: 'Tạm được', class: 'rating-medium' },
  { value: 3, label: 'Dễ nhớ', class: 'rating-easy' }
]

const initStudy = async () => {
  isLoading.value = true
  try {
    const result = await store.fetchDeckById(deckId)
    if (!result) {
      router.push('/')
      return
    }
    deck.value = result
  } catch (error) {
    console.error('Error fetching deck:', error)
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

const rateCard = (rating: number) => {
  if (!deck.value || !currentCard.value || !deckId) return

  const card = currentCard.value
  const now = new Date()
  let nextReview: Date = now

  switch (rating) {
    case 1: // Khó
      nextReview = new Date(now.getTime() + 1000 * 60 * 60 * 24) // 1 ngày
      card.level = Math.max(1, card.level - 1)
      break
    case 2: // Tạm được
      nextReview = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3) // 3 ngày
      break
    case 3: // Dễ
      const interval = Math.pow(2, card.level) // Khoảng thời gian tăng theo cấp số nhân
      nextReview = new Date(now.getTime() + 1000 * 60 * 60 * 24 * interval)
      card.level++
      break
  }

  store.updateCardReview(deckId, card._id, {
    level: card.level,
    nextReview: nextReview
  })

  showAnswer.value = false
  currentCardIndex.value++
}

const restartStudy = () => {
  currentCardIndex.value = 0
  showAnswer.value = false
}

const speakText = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'US English' // Đặt ngôn ngữ là tiếng Việt
  window.speechSynthesis.speak(utterance)
}

// Initialize study session
initStudy()
</script>

<style scoped>
.study-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.test-button {
  padding: 0.75rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  text-decoration: none;
}

.test-button:hover {
  background-color: #059669;
}

.edit-button {
  padding: 0.75rem 1.5rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  text-decoration: none;
}

.edit-button:hover {
  background-color: #4f46e5;
}

.progress {
  margin-top: 1rem;
}

.progress span {
  font-size: 0.875rem;
  color: #666;
}

.progress-bar {
  margin-top: 0.5rem;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #6366f1;
  transition: width 0.3s ease;
}

.card-container {
  perspective: 1000px;
  padding: 2rem 0;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 400px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 1rem;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.card-face.back {
  transform: rotateY(180deg);
}

.card-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  text-align: center;
  line-height: 1.5;
}

.card-hint {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.rating-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.rating-buttons button {
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s;
}

.rating-buttons button:hover {
  transform: translateY(-2px);
}

.rating-hard {
  background-color: #fee2e2;
  color: #dc2626;
}

.rating-medium {
  background-color: #fef3c7;
  color: #d97706;
}

.rating-easy {
  background-color: #dcfce7;
  color: #16a34a;
}

.completion-message {
  text-align: center;
  padding: 4rem 0;
}

.completion-message h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.completion-message p {
  color: #666;
  margin-bottom: 2rem;
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.back-button,
.restart-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
}

.back-button {
  background-color: #f3f4f6;
  color: #374151;
}

.restart-button {
  background-color: #6366f1;
  color: white;
  border: none;
  cursor: pointer;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-state .loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state p {
  color: #666;
}

.error-state {
  text-align: center;
  padding: 4rem 0;
}

.error-state p {
  color: #666;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
}

.content-wrapper p {
  font-size: 1.5rem;
  text-align: center;
  line-height: 1.5;
}

.card-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 0.5rem;
}

.speak-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6366f1;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  z-index: 1;
}

.speak-button:hover {
  background-color: #e0e7ff;
  transform: scale(1.1);
}

.speak-button:active {
  transform: scale(0.95);
}
</style>