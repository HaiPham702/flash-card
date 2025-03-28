<template>
  <div class="study-view">
    <div class="header">
      <h1>{{ deck?.name }}</h1>
      <div class="header-actions">
        <button @click="resetAllCards" class="reset-button">
          <i class="fas fa-redo"></i> Học lại từ đầu
        </button>
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
      <div class="progress" v-if="learningCardsCount">
        <span>{{ currentCardIndex >= learningCardsCount ? learningCardsCount : currentCardIndex + 1 }}/{{
          learningCardsCount }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${((currentCardIndex + 1) / learningCardsCount) * 100}%` }">
          </div>
        </div>
      </div>

      <div v-if="currentCard" class="card-container">

        <div class="navigation-buttons">
          <button class="nav-button prev-button" @click="navigateCard('prev')" :disabled="currentCardIndex === 0">
            <i class="fas fa-arrow-left"></i>
          </button>
          <button class="nav-button next-button" @click="navigateCard('next')">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        <div class="flashcard" :class="{
          flipped: showAnswer,
          'slide-left': slideDirection === 'left',
          'slide-right': slideDirection === 'right',
          'dragging': isDragging
        }" :style="{
          transform: isDragging ? `translateX(${mouseCurrentX - mouseStartX}px)` : undefined,
          transition: isDragging ? 'none' : 'all 0.3s ease'
        }" @click="showAnswer = !showAnswer">
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
          </div>
        </div>
        <div class="study-status-buttons">
          <button class="status-button learning" @click.stop="markCardStatus('learning')"
            :class="{ active: currentCard.level === 1 }">
            <i class="fas fa-book"></i> Đang học
          </button>
          <button class="status-button known" @click.stop="markCardStatus('known')"
            :class="{ active: currentCard.level === 2 }">
            <i class="fas fa-check-circle"></i> Đã biết
          </button>
        </div>
      </div>

      <div v-else class="completion-message show-animation" :class="{ 'show-animation': showCompletion }">
        <div class="completion-content">
          <div class="completion-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="completion-title">
            <h2>🎉 Chúc mừng!</h2>
            <div class="confetti-container">
              <div v-for="n in 50" :key="n" class="confetti" :style="{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)]
              }"></div>
            </div>
          </div>
          <p>Bạn đã hoàn thành phiên học tập này.</p>
          <div class="completion-stats">
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>Thời gian: {{ formatTime(studyTime) }}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-star"></i>
              <span>Thẻ đã học: {{ completedCards }}/{{ deck.cards.length }}</span>
            </div>
          </div>
          <div class="completion-actions">
            <router-link :to="'/deck/' + deckId" class="back-button">
              <i class="fas fa-arrow-left"></i> Quay lại bộ thẻ
            </router-link>
       
          </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const slideDirection = ref<'left' | 'right' | null>(null)
const showCompletion = ref(false)
const studyTime = ref(0)
const completedCards = ref(0)
const studyTimer = ref<number | null>(null)
const isDragging = ref(false)
const mouseStartX = ref(0)
const mouseCurrentX = ref(0)

const currentCard = computed(() => {
  if (!deck.value) return null
  // Chỉ hiển thị các thẻ đang học (level = 1 hoặc chưa có level)
  const learningCards = deck.value.cards.filter(card => !card.level || card.level === 1)
  return currentCardIndex.value < learningCards.length
    ? learningCards[currentCardIndex.value]
    : null
})


const confettiColors = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
]

const learningCardsCount = computed(() => {
  if (!deck.value) return 0
  return deck.value.cards.filter(card => !card.level || card.level === 1).length
})

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft' && currentCardIndex.value > 0) {
    slideDirection.value = 'right'
    setTimeout(() => {
      currentCardIndex.value--
      showAnswer.value = false
      slideDirection.value = null
    }, 300)
  } else if (e.key === 'ArrowRight' && currentCardIndex.value < (deck.value?.cards.length || 0) - 1) {
    slideDirection.value = 'left'
    setTimeout(() => {
      currentCardIndex.value++
      showAnswer.value = false
      slideDirection.value = null
    }, 300)
  }
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const startStudyTimer = () => {
  studyTimer.value = window.setInterval(() => {
    studyTime.value++
  }, 1000)
}

const stopStudyTimer = () => {
  if (studyTimer.value) {
    clearInterval(studyTimer.value)
    studyTimer.value = null
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

  completedCards.value++
  showAnswer.value = false
  if (currentCardIndex.value < deck.value?.cards.length) {
    currentCardIndex.value++
  } else {
    stopStudyTimer()
    setTimeout(() => {
      showCompletion.value = true
    }, 500)
  }
}

const restartStudy = async () => {
  if (!deck.value || !deckId) return

  const now = new Date()
  // Reset tất cả các thẻ về trạng thái đang học
  for (const card of deck.value.cards) {
    await store.updateCardReview(deckId, card._id, {
      level: 1,
      nextReview: now
    })
  }

  // Reset các biến theo dõi
  currentCardIndex.value = 0
  showAnswer.value = false
  showCompletion.value = false
  studyTime.value = 0
  completedCards.value = 0
  startStudyTimer()

  // Tải lại dữ liệu deck
  await initStudy()
}

const speakText = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'US English' // Đặt ngôn ngữ là tiếng Việt
  window.speechSynthesis.speak(utterance)
}

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

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  mouseStartX.value = e.clientX
  mouseCurrentX.value = e.clientX
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  mouseCurrentX.value = e.clientX
}

const handleMouseUp = () => {
  if (!isDragging.value) return
  isDragging.value = false

  const dragDistance = mouseCurrentX.value - mouseStartX.value
  const minDragDistance = 50 // Khoảng cách tối thiểu để xem là kéo

  if (Math.abs(dragDistance) > minDragDistance) {
    if (dragDistance > 0 && currentCardIndex.value > 0) {
      // Kéo sang phải -> quay lại thẻ trước
      slideDirection.value = 'right'
      setTimeout(() => {
        currentCardIndex.value--
        showAnswer.value = false
        slideDirection.value = null
      }, 300)
    } else if (dragDistance < 0 && currentCardIndex.value < (deck.value?.cards.length || 0) - 1) {
      // Kéo sang trái -> chuyển sang thẻ tiếp
      slideDirection.value = 'left'
      setTimeout(() => {
        currentCardIndex.value++
        showAnswer.value = false
        slideDirection.value = null
      }, 300)
    }
  }
}

const navigateCard = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentCardIndex.value > 0) {
    slideDirection.value = 'right'
    setTimeout(() => {
      currentCardIndex.value--
      showAnswer.value = false
      slideDirection.value = null
    }, 300)
  } else if (direction === 'next') {
    slideDirection.value = 'left'
    setTimeout(() => {
      currentCardIndex.value++
      showAnswer.value = false
      slideDirection.value = null
    }, 300)
  }
}

const markCardStatus = async (status: 'learning' | 'known') => {
  if (!deck.value || !currentCard.value || !deckId) return

  const card = currentCard.value
  const newLevel = status === 'learning' ? 1 : 2
  const now = new Date()
  if (status == 'known') {
    await store.updateCardReview(deckId, card._id, {
      level: newLevel,
      nextReview: now
    })
  }

  completedCards.value++
  showAnswer.value = false

  // Chỉ hiển thị các thẻ đang học (level = 1 hoặc chưa có level)
  const learningCards = deck.value.cards.filter(c => !c.level || c.level === 1)
  if (currentCardIndex.value < learningCards.length - 1) {
    currentCardIndex.value++
  } else {
    stopStudyTimer()
    setTimeout(() => {
      currentCardIndex.value++

      showCompletion.value = true
    }, 500)
  }
}

const resetAllCards = async () => {
  if (!deck.value || !deckId) return

  const now = new Date()
  // Reset tất cả các thẻ về trạng thái đang học
  for (const card of deck.value.cards) {
    await store.updateCardReview(deckId, card._id, {
      level: 1,
      nextReview: now
    })
  }

  // Reset các biến theo dõi
  currentCardIndex.value = 0
  showAnswer.value = false
  showCompletion.value = false
  studyTime.value = 0
  completedCards.value = 0
  startStudyTimer()

  // Tải lại dữ liệu deck
  await initStudy()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  startStudyTimer()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  stopStudyTimer()
})

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
  transform-style: preserve-3d;
  transition: all 0.3s ease;
  will-change: transform;
  touch-action: none;
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
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
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
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
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
  padding: 2rem 0;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.completion-message.show-animation {
  opacity: 1;
  transform: scale(1);
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
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.back-button {
  background-color: #f3f4f6;
  color: #374151;
  text-decoration: none;
}

.back-button:hover {
  background-color: #e5e7eb;
  transform: translateY(-2px);
}

.restart-button {
  background-color: #6366f1;
  color: white;
  border: none;
  cursor: pointer;
}

.restart-button:hover {
  background-color: #4f46e5;
  transform: translateY(-2px);
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

.navigation-hints {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hint i {
  color: #6366f1;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 50%;
  left: -60px;
  right: -60px;
  transform: translateY(-50%);
  z-index: 10;
  pointer-events: none;
}

.nav-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #6366f1;
  transition: all 0.2s ease;
  pointer-events: auto;
}

.nav-button:hover:not(:disabled) {
  transform: scale(1.1);
  background-color: #e0e7ff;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 400px;
  cursor: grab;
  transform-style: preserve-3d;
  transition: all 0.3s ease;
  will-change: transform;
  touch-action: none;
}

.flashcard.dragging {
  cursor: grabbing;
  transition: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.flashcard.slide-left {
  transform: translateX(100px) rotate(-5deg);
  opacity: 0;
}

.flashcard.slide-right {
  transform: translateX(-100px) rotate(5deg);
  opacity: 0;
}

.completion-content {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  animation: gradient-shift 3s ease infinite;
  color: white;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.completion-title {
  position: relative;
  margin-bottom: 2rem;
  color: white;
}

.completion-title h2 {
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.completion-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  backdrop-filter: blur(5px);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 500;
}

.stat-item i {
  color: white;
  font-size: 1.25rem;
}

.completion-message p {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  font-size: 1.2rem;
}

.back-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  backdrop-filter: blur(5px);
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.completion-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease infinite;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.completion-icon i {
  background: linear-gradient(45deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: confetti-fall 3s ease-in-out infinite;
  opacity: 0.8;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.study-status-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.status-button {
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.status-button.learning {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.status-button.learning:hover {
  background-color: #c7d2fe;
  transform: translateY(-2px);
}

.status-button.learning.active {
  background-color: #4f46e5;
  color: white;
}

.status-button.known {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-button.known:hover {
  background-color: #bbf7d0;
  transform: translateY(-2px);
}

.status-button.known.active {
  background-color: #16a34a;
  color: white;
}

.reset-button {
  padding: 0.75rem 1.5rem;
  background-color: #f59e0b;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.reset-button:hover {
  background-color: #d97706;
  transform: translateY(-2px);
}
</style>