<script setup lang="ts">
import DailySpeakingCard from '@/components/DailySpeakingCard.vue'
import WeeklyStreak from '@/components/WeeklyStreak.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Configurable target date - change this to any date you want to count down to
const targetDateString = ref('2025-12-31T23:59:59')
const targetDate = computed(() => new Date(targetDateString.value))

// Optional display text for the countdown
const countdownText = ref('Thời gian còn lại để học tập đến cuối năm 2025:')

// Time calculation
const now = ref(new Date())
const timer = ref(null as any)

// Update current time every second
onMounted(() => {
  timer.value = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer.value)
})

const timeRemaining = computed(() => {
  const difference = targetDate.value.getTime() - now.value.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  const remainingDays = days % 30
  
  return {
    years,
    months: months % 12,
    days: remainingDays,
    isValid: difference > 0
  }
})
</script>

<template>
  <div class="home">
    <div class="hero">
      <h1>Flash Card</h1>
      <div class="countdown" v-if="timeRemaining.isValid">
        <p>{{ countdownText }}</p>
        <div class="countdown-timer">
          <div class="countdown-item">
            <span class="countdown-value">{{ timeRemaining.years }}</span>
            <span class="countdown-label">Năm</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value">{{ timeRemaining.months }}</span>
            <span class="countdown-label">Tháng</span>
          </div>
          <div class="countdown-item">
            <span class="countdown-value">{{ timeRemaining.days }}</span>
            <span class="countdown-label">Ngày</span>
          </div>
        </div>
      </div>
      <router-link to="/decks" class="cta-button">
        Bắt đầu học ngay
      </router-link>
    </div>

    <div class="stats-section">
      <WeeklyStreak />
    </div>

    <div class="daily-section">
      <DailySpeakingCard />
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border-radius: 1rem;
  color: white;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.countdown {
  margin-bottom: 2rem;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  min-width: 5rem;
}

.countdown-value {
  font-size: 2rem;
  font-weight: bold;
}

.countdown-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: white;
  color: #6366f1;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: bold;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.feature-card {
  padding: 2rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

.feature-card i {
  font-size: 2rem;
  color: #6366f1;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
}

.daily-section {
  margin-top: 3rem;
}

.stats-section {
  margin-bottom: 3rem;
}
</style>
