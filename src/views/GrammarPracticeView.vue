<template>
  <div class="grammar-practice-view">
    <div class="container">
      <div class="practice-header">
        <router-link :to="backLink" class="back-link">
          <i class="fas fa-arrow-left"></i> Quay lại
        </router-link>
        <h1>{{ title }}</h1>
        <p class="practice-description">{{ description }}</p>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Đang tải bài tập...</p>
      </div>

      <div v-else-if="questions.length === 0" class="no-questions">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Không có bài tập</h2>
        <p>Hiện tại chưa có bài tập cho chủ đề này. Vui lòng thử lại sau.</p>
        <router-link :to="backLink" class="back-button">
          Quay lại
        </router-link>
      </div>

      <div v-else class="practice-content">
        <div v-if="!practiceFinished" class="question-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{width: `${(currentIndex + 1) / questions.length * 100}%`}"
            ></div>
          </div>
          <div class="question-counter">
            Câu hỏi {{ currentIndex + 1 }}/{{ questions.length }}
          </div>

          <!-- Multiple Choice Question -->
          <div v-if="currentQuestion?.type === 'multiple-choice'" class="question-content">
            <div class="question-text" v-html="currentQuestion?.question"></div>
            <div class="options-container">
              <div 
                v-for="(option, index) in currentQuestion?.options" 
                :key="index"
                class="option"
                :class="{
                  'selected': selectedOption === index,
                  'correct': showAnswer && isCorrectOption(index),
                  'incorrect': showAnswer && selectedOption === index && !isCorrectOption(index)
                }"
                @click="selectOption(index)"
              >
                <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
                <div class="option-text">{{ option }}</div>
              </div>
            </div>
          </div>

          <!-- Fill in the Blanks Question -->
          <div v-else-if="currentQuestion?.type === 'fill-blanks'" class="question-content">
            <div class="question-text" v-html="currentQuestion?.question"></div>
            <div class="fill-blank-container">
              <input 
                type="text" 
                v-model="blankAnswer" 
                placeholder="Nhập câu trả lời..."
                :disabled="showAnswer"
                @keyup.enter="checkAnswer"
                class="blank-input"
                :class="{'correct-input': showAnswer && isCorrectAnswer, 'incorrect-input': showAnswer && !isCorrectAnswer}"
              />
            </div>
          </div>

          <!-- Error Correction Question -->
          <div v-else-if="currentQuestion?.type === 'error-correction'" class="question-content">
            <div class="question-text" v-html="currentQuestion?.question"></div>
            <div class="error-correction-container">
              <div class="error-instruction">Hãy sửa lỗi ngữ pháp trong câu trên:</div>
              <input 
                type="text" 
                v-model="correctionAnswer" 
                placeholder="Nhập câu đã được sửa..."
                :disabled="showAnswer"
                class="correction-input"
                :class="{'correct-input': showAnswer && isCorrectAnswer, 'incorrect-input': showAnswer && !isCorrectAnswer}"
              />
            </div>
          </div>

          <!-- Sentence Transformation Question -->
          <div v-else-if="currentQuestion?.type === 'sentence-transformation'" class="question-content">
            <div class="question-text" v-html="currentQuestion?.question"></div>
            <div class="transformation-container">
              <textarea 
                v-model="transformationAnswer" 
                placeholder="Viết lại câu..."
                :disabled="showAnswer"
                class="transformation-input"
                :class="{'correct-input': showAnswer && isCorrectAnswer, 'incorrect-input': showAnswer && !isCorrectAnswer}"
              ></textarea>
            </div>
          </div>

          <div class="question-actions">
            <button 
              v-if="!showAnswer" 
              @click="checkAnswer" 
              class="check-button"
              :disabled="!canCheckAnswer"
            >
              Kiểm tra
            </button>
            <button 
              v-else 
              @click="nextQuestion" 
              class="next-button"
            >
              {{ isLastQuestion ? 'Kết thúc bài tập' : 'Câu tiếp theo' }}
            </button>
          </div>

          <div v-if="showAnswer && currentQuestion" class="answer-feedback">
            <div 
              class="feedback-content" 
              :class="{'correct-feedback': isCorrectAnswer, 'incorrect-feedback': !isCorrectAnswer}"
            >
              <div class="feedback-icon">
                <i :class="isCorrectAnswer ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
              </div>
              <div class="feedback-text">
                <div class="feedback-title">
                  {{ isCorrectAnswer ? 'Chính xác!' : 'Chưa chính xác!' }}
                </div>
                <div v-if="!isCorrectAnswer" class="correct-answer">
                  Đáp án đúng: <strong>{{ formattedCorrectAnswer }}</strong>
                </div>
                <div v-if="currentQuestion.explanation" class="answer-explanation">
                  <strong>Giải thích:</strong> {{ currentQuestion.explanation }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="results-container">
          <div class="results-header">
            <div class="results-icon">
              <i class="fas fa-award"></i>
            </div>
            <h2>Kết quả bài tập</h2>
          </div>

          <div class="score-display">
            <div class="score-circle">
              <div class="score-number">{{ correctAnswers }}</div>
              <div class="score-total">/ {{ questions.length }}</div>
            </div>
            <div class="score-text">
              Bạn đã trả lời đúng {{ correctAnswers }} trên {{ questions.length }} câu hỏi
            </div>
          </div>

          <div class="results-actions">
            <button @click="retryPractice" class="retry-button">
              <i class="fas fa-redo"></i> Làm lại bài tập
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
import type { PracticeQuestion } from '@/types/grammar'

const route = useRoute()
const router = useRouter()
const grammarStore = useGrammarStore()

const loading = ref(true)
const questions = ref<PracticeQuestion[]>([])
const currentIndex = ref(0)
const showAnswer = ref(false)
const selectedOption = ref(-1)
const blankAnswer = ref('')
const correctionAnswer = ref('')
const transformationAnswer = ref('')
const correctAnswers = ref(0)
const practiceFinished = ref(false)

// Determine the source of practice questions (day or category)
const isDayPractice = computed(() => route.name === 'grammar-practice-day')
const sourceId = computed(() => {
  if (isDayPractice.value) {
    return parseInt(route.params.dayId as string)
  }
  return route.params.categoryId as string
})

// Determine back link
const backLink = computed(() => {
  if (isDayPractice.value) {
    return `/grammar/topic/day-${sourceId.value}`
  }
  return '/grammar'
})

// Practice title and description
const title = computed(() => {
  if (loading.value) return 'Đang tải...'
  
  if (isDayPractice.value) {
    return `Bài tập - Ngày ${sourceId.value}`
  }
  
  // Category practice
  const categoryTitles: Record<string, string> = {
    'multiple-choice': 'Bài tập trắc nghiệm',
    'fill-blanks': 'Bài tập điền vào chỗ trống',
    'error-correction': 'Bài tập sửa lỗi',
    'sentence-transformation': 'Bài tập chuyển đổi câu'
  }
  
  return categoryTitles[sourceId.value as string] || 'Bài tập ngữ pháp'
})

const description = computed(() => {
  if (loading.value) return ''
  
  if (isDayPractice.value) {
    const day = grammarStore.grammarDays.find(d => d.id === sourceId.value)
    return day ? `Luyện tập về: ${day.topics.join(', ')}` : 'Bài tập luyện tập ngữ pháp'
  }
  
  // Category descriptions
  const categoryDescriptions: Record<string, string> = {
    'multiple-choice': 'Trả lời các câu hỏi trắc nghiệm để kiểm tra kiến thức ngữ pháp',
    'fill-blanks': 'Điền vào chỗ trống để hoàn thiện câu đúng ngữ pháp',
    'error-correction': 'Tìm và sửa lỗi ngữ pháp trong các câu',
    'sentence-transformation': 'Viết lại câu với cấu trúc khác mà không thay đổi nghĩa'
  }
  
  return categoryDescriptions[sourceId.value as string] || 'Luyện tập để nâng cao kiến thức ngữ pháp'
})

// Current question
const currentQuestion = computed(() => {
  if (questions.value.length === 0) return null
  return questions.value[currentIndex.value]
})

const isLastQuestion = computed(() => {
  return currentIndex.value === questions.value.length - 1
})

// Logic for checking answers
const isCorrectOption = (index: number) => {
  if (!currentQuestion.value || !currentQuestion.value.options) return false
  return currentQuestion.value.options[index] === currentQuestion.value.correctAnswer
}

const isCorrectAnswer = computed(() => {
  if (!currentQuestion.value) return false
  
  switch (currentQuestion.value.type) {
    case 'multiple-choice':
      return selectedOption.value !== -1 && 
        currentQuestion.value.options?.[selectedOption.value] === currentQuestion.value.correctAnswer
    case 'fill-blanks':
      return blankAnswer.value.toLowerCase().trim() === (currentQuestion.value.correctAnswer as string).toLowerCase().trim()
    case 'error-correction':
      return correctionAnswer.value.toLowerCase().trim() === (currentQuestion.value.correctAnswer as string).toLowerCase().trim()
    case 'sentence-transformation':
      return transformationAnswer.value.toLowerCase().trim() === (currentQuestion.value.correctAnswer as string).toLowerCase().trim()
    default:
      return false
  }
})

const formattedCorrectAnswer = computed(() => {
  if (!currentQuestion.value) return ''
  
  if (currentQuestion.value.type === 'multiple-choice' && currentQuestion.value.options) {
    const correctIndex = currentQuestion.value.options.findIndex(
      option => option === currentQuestion.value?.correctAnswer
    )
    return correctIndex !== -1 ? currentQuestion.value.options[correctIndex] : ''
  }
  
  return currentQuestion.value.correctAnswer as string
})

const canCheckAnswer = computed(() => {
  if (!currentQuestion.value) return false
  
  switch (currentQuestion.value.type) {
    case 'multiple-choice':
      return selectedOption.value !== -1
    case 'fill-blanks':
      return blankAnswer.value.trim() !== ''
    case 'error-correction':
      return correctionAnswer.value.trim() !== ''
    case 'sentence-transformation':
      return transformationAnswer.value.trim() !== ''
    default:
      return false
  }
})

// Actions
const selectOption = (index: number) => {
  if (showAnswer.value) return
  selectedOption.value = index
}

const checkAnswer = () => {
  if (!canCheckAnswer.value) return
  
  showAnswer.value = true
  if (isCorrectAnswer.value) {
    correctAnswers.value++
  }
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    practiceFinished.value = true
  } else {
    currentIndex.value++
    resetQuestionState()
  }
}

const resetQuestionState = () => {
  showAnswer.value = false
  selectedOption.value = -1
  blankAnswer.value = ''
  correctionAnswer.value = ''
  transformationAnswer.value = ''
}

const retryPractice = () => {
  currentIndex.value = 0
  correctAnswers.value = 0
  practiceFinished.value = false
  resetQuestionState()
}

// Load practice questions
onMounted(async () => {
  loading.value = true
  
  try {
    // In a real app, you would fetch the questions from an API
    // For now, we'll use mock data
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    // Mock questions - this would be replaced with actual API data
    questions.value = [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'Which of the following is a proper noun?',
        options: ['happiness', 'Paris', 'building', 'knowledge'],
        correctAnswer: '1',
        explanation: 'Paris is a proper noun because it names a specific city.',
        difficulty: 'easy',
        relatedTopic: 'nouns'
      },
      {
        id: '2',
        type: 'multiple-choice',
        question: 'Choose the correct form of the verb: "She _____ to school every day."',
        options: ['go', 'goes', 'going', 'is go'],
        correctAnswer: '1',
        explanation: 'With third-person singular subjects (he, she, it) in the present simple, we add -s or -es to the verb.',
        difficulty: 'easy',
        relatedTopic: 'verbs'
      },
      {
        id: '3',
        type: 'fill-blanks',
        question: 'Please fill in the blank with the correct article: "She is _____ university student."',
        correctAnswer: ['a'],
        explanation: '"University" begins with a consonant sound (yu-ni-ver-si-ty), so we use "a" instead of "an".',
        difficulty: 'easy',
        relatedTopic: 'articles'
      },
      {
        id: '4',
        type: 'error-correction',
        question: 'Correct the following sentence: "She have three children."',
        correctAnswer: ['She has three children.'],
        explanation: 'With third-person singular subjects (he, she, it) in the present simple, we use "has" instead of "have".',
        difficulty: 'medium',
        relatedTopic: 'verbs'
      },
      {
        id: '5',
        type: 'sentence-transformation',
        question: 'Rewrite the sentence using "used to": "I played tennis when I was younger."',
        correctAnswer: ['I used to play tennis when I was younger.', 'I used to play tennis.'],
        explanation: '"used to" expresses a past habit or state that is no longer true.',
        difficulty: 'medium',
        relatedTopic: 'verbs'
      }
    ]
  } catch (error) {
    console.error('Error loading practice questions:', error)
    questions.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.grammar-practice-view {
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

.practice-header {
  margin-bottom: 2rem;
  text-align: center;
}

.back-link {
  position: absolute;
  left: 2rem;
  top: 2rem;
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

.practice-description {
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

.no-questions {
  text-align: center;
  padding: 3rem 0;
}

.no-questions i {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.no-questions h2 {
  margin-bottom: 0.5rem;
}

.no-questions p {
  margin-bottom: 1.5rem;
  color: #6b7280;
}

.practice-content {
  max-width: 800px;
  margin: 0 auto;
}

.question-container {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.question-counter {
  text-align: right;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.question-content {
  margin-bottom: 2rem;
}

.question-text {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover:not(.selected, .correct, .incorrect) {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.option.selected {
  border-color: var(--primary-color);
  background-color: #eff6ff;
}

.option.correct {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.option.incorrect {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.option-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 50%;
  font-weight: 600;
}

.option.selected .option-letter {
  background-color: var(--primary-color);
  color: white;
}

.option.correct .option-letter {
  background-color: #10b981;
  color: white;
}

.option.incorrect .option-letter {
  background-color: #ef4444;
  color: white;
}

.fill-blank-container,
.error-correction-container,
.transformation-container {
  margin-bottom: 1.5rem;
}

.blank-input,
.correction-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
}

.transformation-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s;
}

.blank-input:focus,
.correction-input:focus,
.transformation-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.correct-input {
  border-color: #10b981 !important;
  background-color: #ecfdf5;
}

.incorrect-input {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}

.error-instruction {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.question-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.check-button,
.next-button {
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.check-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.check-button:hover:not(:disabled) {
  background-color: #4f46e5;
}

.check-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.next-button {
  background-color: #10b981;
  color: white;
  border: none;
}

.next-button:hover {
  background-color: #059669;
}

.answer-feedback {
  margin-top: 1.5rem;
}

.feedback-content {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 6px;
}

.correct-feedback {
  background-color: #ecfdf5;
}

.incorrect-feedback {
  background-color: #fef2f2;
}

.feedback-icon {
  font-size: 2rem;
}

.correct-feedback .feedback-icon {
  color: #10b981;
}

.incorrect-feedback .feedback-icon {
  color: #ef4444;
}

.feedback-text {
  flex: 1;
}

.feedback-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.correct-answer {
  margin-bottom: 0.5rem;
}

.answer-explanation {
  font-size: 0.95rem;
  color: #4b5563;
}

/* Results page */
.results-container {
  text-align: center;
  padding: 2rem 0;
}

.results-header {
  margin-bottom: 2rem;
}

.results-icon {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.score-display {
  margin-bottom: 2rem;
}

.score-circle {
  width: 150px;
  height: 150px;
  background-color: #eff6ff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  position: relative;
}

.score-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
}

.score-total {
  font-size: 1.2rem;
  color: #6b7280;
}

.score-text {
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.retry-button,
.back-button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.retry-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.retry-button:hover {
  background-color: #4f46e5;
}

.back-button {
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  text-decoration: none;
}

.back-button:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}
</style> 