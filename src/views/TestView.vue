<template>
  <div class="test-view">
    <div class="sidebar">
      <h3>Danh sách câu hỏi</h3>
      <div class="questions-list">
        <button v-for="(card, index) in deck?.cards" :key="card.id" class="question-item" :class="{
          'current': currentQuestionIndex === index,
          'answered': answers[index],
          'correct': showResults && questionScores[index] === 1,
          'incorrect': showResults && questionScores[index] === 0
        }" @click="navigateToQuestion(index)">
          <span class="question-number">{{ index + 1 }}</span>
          <span class="question-status">
            <i v-if="showResults && questionScores[index] === 1" class="fas fa-check" style="color: #10b981;"></i>
            <i v-else-if="showResults && questionScores[index] === 0" class="fas fa-times" style="color: #ef4444;"></i>
            <i v-else-if="answers[index]" class="fas fa-check"></i>
            <i v-else class="fas fa-minus"></i>
          </span>
        </button>
      </div>
    </div>

    <div class="main-content">
      <div class="header">
        <h1>Kiểm tra - {{ deck?.name }}</h1>
        <div class="header-actions">
          <router-link :to="'/deck/' + deckId" class="back-button">
            <i class="fa-solid fa-circle-left"></i> Quay lại bộ thẻ
          </router-link>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <template v-else-if="deck && !showResults">
        <div class="progress">
          <span>Câu {{ currentQuestionIndex + 1 }}/{{ deck.cards.length }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${((currentQuestionIndex + 1) / deck.cards.length) * 100}%` }">
            </div>
          </div>
        </div>

        <div v-if="currentQuestion" class="question-container">
          <div class="question">
            <h2>Câu {{ currentQuestionIndex + 1 }}</h2>
            <div class="question-content">
              <p>{{ currentQuestion.back }}</p>
              <img v-if="currentQuestion.image" :src="currentQuestion.image" alt="Question image"
                class="question-image">
            </div>
          </div>

          <div class="answer-section">
            <input v-model="userAnswer" type="text" placeholder="Nhập câu trả lời của bạn..." class="answer-input">

            <div class="action-buttons">
              <button @click="nextQuestion" class="next-button">
                {{ isLastQuestion ? 'Nộp bài' : 'Câu tiếp theo' }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="showResults" class="results">
        <h2>Kết quả kiểm tra</h2>
        <div class="questions-review">
          <h3>Chi tiết bài làm:</h3>
          <div v-for="(card, index) in deck?.cards" :key="card.id" class="question-review" :class="{
            'correct': questionScores[index] === 1,
            'incorrect': questionScores[index] === 0
          }">
            <div class="question-header">
              <h4>Câu {{ index + 1 }}</h4>
              <div class="score-input">
                <label>Điểm:</label>
                <select v-model="questionScores[index]" @change="updateTotalScore">
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </div>
            </div>
            <div class="question-content">
              <p class="question-text"><strong>Đề bài:</strong> {{ card.back }}</p>
              <p class="model-answer"><strong>Đáp án mẫu:</strong> {{ card.front }}</p>
              <p class="user-answer" :class="{ 'no-answer': !answers[index] }">
                <strong>Câu trả lời của bạn:</strong>
                <span>{{ answers[index] || 'Chưa trả lời' }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="score-summary">
          <p>Tổng điểm: {{ totalScore }}/{{ maxScore }}</p>
          <p>Tỷ lệ: {{ (totalScore / maxScore * 100).toFixed(1) }}%</p>
        </div>
        <div class="result-actions">
          <button @click="restartTest" class="restart-button">
            Làm lại bài kiểm tra
          </button>
          <router-link :to="'/deck/' + deckId" class="back-button">
            Quay lại bộ thẻ
          </router-link>
        </div>
      </div>

      <div v-else class="error-state">
        <p>Không tìm thấy bộ thẻ này</p>
        <router-link to="/" class="back-button">Quay lại trang chủ</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeckStore } from '@/stores/deck'

interface Card {
  _id: any
  id: any
  front: string
  back: string
  image?: string
  lastReview?: Date
  nextReview?: Date
  level: number
}

interface Deck {
  _id: any
  id: any
  name: string
  description: string
  cards: Card[]
}

const route = useRoute()
const router = useRouter()
const store = useDeckStore()
const deckId = route.params.deckId

const isLoading = ref(true)
const deck = ref<Deck | null>(null)
const currentQuestionIndex = ref(0)
const userAnswer = ref('')
const correctAnswers = ref(0)
const showResults = ref(false)
const answers = ref<string[]>([])
const questionScores = ref<number[]>([])
const markedQuestions = ref<boolean[]>([])
const totalScore = ref(0)
const maxScore = ref(0)

const currentQuestion = computed(() => {
  if (!deck.value) return null
  return currentQuestionIndex.value < deck.value.cards.length
    ? deck.value.cards[currentQuestionIndex.value]
    : null
})

const totalQuestions = computed(() => deck.value?.cards.length || 0)

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === (deck.value?.cards.length || 0) - 1
})

const isCurrentQuestionMarked = computed(() => {
  return markedQuestions.value[currentQuestionIndex.value] || false
})

const initTest = async () => {
  isLoading.value = true
  try {
    const result = await store.fetchDeckById(deckId)
    if (!result || !result._id) {
      router.push('/')
      return
    }
    deck.value = result
    // Khởi tạo mảng câu trả lời và điểm số
    if (deck.value) {
      answers.value = new Array(deck.value.cards.length).fill('')
      questionScores.value = new Array(deck.value.cards.length).fill(0)
      markedQuestions.value = new Array(deck.value.cards.length).fill(false)
      maxScore.value = deck.value.cards.length // Mỗi câu 1 điểm
      // Xáo trộn thứ tự các câu hỏi
      if (deck.value.cards.length > 0) {
        deck.value.cards = [...deck.value.cards].sort(() => Math.random() - 0.5)
      }
    }
  } catch (error) {
    console.error('Error fetching deck:', error)
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

const nextQuestion = () => {
  // Lưu câu trả lời hiện tại
  answers.value[currentQuestionIndex.value] = userAnswer.value

  // Tự động chấm điểm cho câu hiện tại
  if (currentQuestion.value) {
    const userAnswerNormalized = userAnswer.value.trim().toLowerCase()
    const correctAnswerNormalized = currentQuestion.value.front.trim().toLowerCase()
    questionScores.value[currentQuestionIndex.value] = userAnswerNormalized === correctAnswerNormalized ? 1 : 0
    updateTotalScore()
  }

  if (isLastQuestion.value) {
    showResults.value = true
  } else {
    currentQuestionIndex.value++
    userAnswer.value = ''
  }
}

const updateTotalScore = () => {
  totalScore.value = questionScores.value.reduce((sum, score) => sum + Number(score), 0)
}

const restartTest = () => {
  currentQuestionIndex.value = 0
  userAnswer.value = ''
  showResults.value = false
  answers.value = new Array(deck.value?.cards.length || 0).fill('')
  questionScores.value = new Array(deck.value?.cards.length || 0).fill(0)
  markedQuestions.value = new Array(deck.value?.cards.length || 0).fill(false)
  totalScore.value = 0
  // Xáo trộn lại thứ tự câu hỏi
  if (deck.value?.cards.length) {
    deck.value.cards = [...deck.value.cards].sort(() => Math.random() - 0.5)
  }
}

const navigateToQuestion = (index: number) => {
  currentQuestionIndex.value = index
  userAnswer.value = ''
}

// Initialize test session
initTest()
</script>

<style scoped>
.test-view {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  gap: 2rem;
}

.sidebar {
  width: 200px;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
  height: fit-content;
}

.sidebar h3 {
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1rem;
}

.questions-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.question-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.question-item:hover {
  background-color: #f3f4f6;
}

.question-item.current {
  background-color: #6366f1;
  color: white;
  border-color: #6366f1;
}

.question-item.answered {
  border-color: #10b981;
}

.question-item.answered .question-status {
  color: #10b981;
}

.question-item.correct {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.question-item.incorrect {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.question-item.correct .question-status {
  color: #10b981;
}

.question-item.incorrect .question-status {
  color: #ef4444;
}

.question-number {
  font-weight: 500;
  font-size: 0.875rem;
}

.question-status {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.main-content {
  flex: 1;
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

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  text-decoration: none;
}

.back-button:hover {
  background-color: #e5e7eb;
}

.progress {
  margin-bottom: 2rem;
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

.question-container {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 2rem;
}

.question {
  margin-bottom: 2rem;
}

.question h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #374151;
}

.question-content {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #1f2937;
}

.question-image {
  margin-top: 1rem;
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 0.5rem;
}

.answer-section {
  margin-top: 2rem;
}

.answer-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.answer-input:focus {
  outline: none;
  border-color: #6366f1;
}

.answer-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 1rem;
}

.check-button,
.next-button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.next-button {
  background-color: #10b981;
  color: white;
}

.next-button:hover {
  background-color: #059669;
}

.questions-review {
  margin: 2rem 0;
  text-align: left;
}

.question-review {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid #e5e7eb;
  transition: all 0.3s ease;
}

.question-review.correct {
  border-left-color: #10b981;
  background-color: #f0fdf4;
}

.question-review.incorrect {
  border-left-color: #ef4444;
  background-color: #fef2f2;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-header h4 {
  font-size: 1.125rem;
  color: #374151;
  margin: 0;
}

.score-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-input select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  background-color: white;
  cursor: pointer;
}

.score-input select:focus {
  outline: none;
  border-color: #6366f1;
  ring: 2px solid #e0e7ff;
}

.question-text {
  font-size: 1rem;
  color: #1f2937;
  padding: 0.75rem;
  background-color: #ffffff;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
}

.model-answer {
  font-size: 1rem;
  color: #1f2937;
  padding: 0.75rem;
  background-color: #f0f9ff;
  border-radius: 0.375rem;
  border-left: 3px solid #3b82f6;
  margin: 0.5rem 0;
}

.user-answer {
  font-size: 1rem;
  color: #1f2937;
  padding: 0.75rem;
  background-color: #f0fdf4;
  border-radius: 0.375rem;
  border-left: 3px solid #10b981;
  margin: 0.5rem 0;
}

.user-answer.no-answer {
  background-color: #fee2e2;
  border-left-color: #ef4444;
}

.user-answer.no-answer span {
  color: #ef4444;
  font-style: italic;
}

.results {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.results h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #374151;
}

.score-summary {
  margin-bottom: 2rem;
  font-size: 1.25rem;
  line-height: 1.6;
  color: #4b5563;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.restart-button {
  padding: 0.75rem 1.5rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.restart-button:hover {
  background-color: #4f46e5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
</style>