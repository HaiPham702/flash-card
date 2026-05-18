<template>
  <main class="practice-page">
    <section class="practice-header">
      <div>
        <p class="eyebrow">IELTS weekly practice</p>
        <h1>{{ weekTitle }}</h1>
        <p class="date-range">{{ dateRange }}</p>
      </div>
      <div class="penalty-box">
        <span>Current penalty</span>
        <strong>{{ formatCurrency(week?.penaltyAmount || 0) }}</strong>
      </div>
    </section>

    <div v-if="isLoading" class="state-panel">
      <div class="spinner"></div>
      <p>Loading weekly checklist...</p>
    </div>

    <div v-else-if="errorMessage" class="state-panel error">
      <i class="fas fa-circle-exclamation"></i>
      <p>{{ errorMessage }}</p>
      <button @click="loadData">Retry</button>
    </div>

    <template v-else>
      <section class="summary-grid">
        <div class="summary-card">
          <span>Progress</span>
          <strong>{{ completedCount }}/{{ totalCount }}</strong>
          <small>{{ progressPercent }}% completed</small>
        </div>
        <div class="summary-card">
          <span>Missing</span>
          <strong>{{ missingCount }}</strong>
          <small>{{ statusText }}</small>
        </div>
        <div class="summary-card">
          <span>Deadline</span>
          <strong>{{ deadlineText }}</strong>
          <small>{{ isLocked ? 'Finalized' : 'Editable this week' }}</small>
        </div>
        <div class="summary-card">
          <span>Worst skill</span>
          <strong>{{ stats?.worstSkill || 'None' }}</strong>
          <small>This month: {{ formatCurrency(stats?.monthlyPenalty || 0) }}</small>
        </div>
      </section>

      <section class="progress-section">
        <div class="progress-label">
          <span>{{ statusText }}</span>
          <strong>{{ progressPercent }}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </section>

      <section class="content-grid">
        <div class="checklist-panel">
          <div class="section-title">
            <h2>Weekly checklist</h2>
            <span>{{ missingCount }} tasks missing</span>
          </div>

          <div class="task-list">
            <button
              v-for="task in tasks"
              :key="task._id"
              class="task-row"
              :class="{ done: task.isCompleted }"
              :disabled="savingTaskId === task._id || isLocked"
              @click="toggleTask(task)"
            >
              <span class="check-icon">
                <i :class="task.isCompleted ? 'fas fa-check' : 'far fa-circle'"></i>
              </span>
              <span class="task-info">
                <strong>{{ skillLabel(task) }} - Session {{ task.sessionNo }}</strong>
                <small>{{ task.isCompleted ? completedAt(task.completedAt) : 'Not completed yet' }}</small>
              </span>
              <span class="task-status">{{ task.isCompleted ? 'Done' : 'Open' }}</span>
            </button>
          </div>
        </div>

        <aside class="stats-panel">
          <div class="section-title">
            <h2>Personal stats</h2>
          </div>
          <div class="stat-list">
            <div>
              <span>Perfect weeks</span>
              <strong>{{ stats?.perfectWeeks || 0 }}</strong>
            </div>
            <div>
              <span>Current streak</span>
              <strong>{{ stats?.currentStreak || 0 }}</strong>
            </div>
            <div>
              <span>Total weeks</span>
              <strong>{{ stats?.totalWeeks || 0 }}</strong>
            </div>
          </div>

          <div class="skill-breakdown">
            <h3>Skill missing rate</h3>
            <div v-for="item in skillBreakdown" :key="item.skill" class="skill-row">
              <span>{{ item.skill }}</span>
              <div class="mini-track">
                <div class="mini-fill" :style="{ width: `${item.rate}%` }"></div>
              </div>
              <strong>{{ item.missed }}/{{ item.total }}</strong>
            </div>
          </div>
        </aside>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { practiceApi, type PracticeStats, type WeeklyPractice, type WeeklyPracticeTask } from '@/api/practice'
import { useNotificationStore } from '@/stores/notification'

const notification = useNotificationStore()
const week = ref<WeeklyPractice | null>(null)
const tasks = ref<WeeklyPracticeTask[]>([])
const stats = ref<PracticeStats | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const savingTaskId = ref('')

const totalCount = computed(() => week.value?.totalTasks || tasks.value.length)
const completedCount = computed(() => week.value?.completedTasks || tasks.value.filter(task => task.isCompleted).length)
const missingCount = computed(() => Math.max(0, totalCount.value - completedCount.value))
const progressPercent = computed(() => totalCount.value ? Math.round((completedCount.value / totalCount.value) * 100) : 0)
const isLocked = computed(() => week.value?.status === 'finalized' || (week.value ? new Date() > new Date(week.value.weekEnd) : false))

const weekTitle = computed(() => {
  if (!week.value) return 'Weekly Practice Tracker'
  return `Week ${week.value.weekNo} - ${week.value.year}`
})

const dateRange = computed(() => {
  if (!week.value) return ''
  return `${formatDate(week.value.weekStart)} - ${formatDate(week.value.weekEnd)}`
})

const deadlineText = computed(() => week.value ? formatDateTime(week.value.weekEnd) : '--')

const statusText = computed(() => {
  if (progressPercent.value === 100) return 'Excellent'
  if (progressPercent.value >= 60) return 'On Track'
  return 'Behind Schedule'
})

const skillBreakdown = computed(() => {
  const source = stats.value?.skillStats || {}
  return Object.entries(source).map(([skill, value]) => ({
    skill,
    total: value.total,
    missed: value.missed,
    rate: value.total ? Math.round((value.missed / value.total) * 100) : 0
  }))
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function completedAt(value?: string | null) {
  return value ? `Completed ${formatDateTime(value)}` : 'Completed'
}

function skillLabel(task: WeeklyPracticeTask) {
  return task.label || task.skillType
}

async function loadData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [current, userStats] = await Promise.all([
      practiceApi.getCurrentWeek(),
      practiceApi.getStats()
    ])
    week.value = current.week
    tasks.value = current.tasks
    stats.value = userStats
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Cannot load weekly practice'
  } finally {
    isLoading.value = false
  }
}

async function toggleTask(task: WeeklyPracticeTask) {
  savingTaskId.value = task._id
  try {
    const result = task.isCompleted
      ? await practiceApi.uncompleteTask(task._id)
      : await practiceApi.completeTask(task._id)
    week.value = result.week
    tasks.value = tasks.value.map(item => item._id === result.task._id ? result.task : item)
    stats.value = await practiceApi.getStats()
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Cannot update task')
  } finally {
    savingTaskId.value = ''
  }
}

onMounted(loadData)
</script>

<style scoped>
.practice-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 2rem;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
}

.eyebrow,
.date-range,
.summary-card span,
.summary-card small,
.task-info small,
.stat-list span,
.section-title span {
  color: #6b7280;
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.practice-header h1 {
  font-size: 2rem;
  color: #111827;
}

.penalty-box {
  min-width: 230px;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #111827;
  color: white;
}

.penalty-box span {
  display: block;
  color: #d1d5db;
}

.penalty-box strong {
  font-size: 1.5rem;
}

.summary-grid,
.content-grid {
  display: grid;
  gap: 1rem;
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-card,
.checklist-panel,
.stats-panel,
.state-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.summary-card strong {
  display: block;
  margin: 0.25rem 0;
  font-size: 1.5rem;
  color: #111827;
}

.progress-section {
  margin: 1rem 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.progress-track,
.mini-track {
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-track {
  height: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.2s ease;
}

.content-grid {
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: start;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-title h2 {
  font-size: 1.15rem;
}

.task-list {
  display: grid;
  gap: 0.75rem;
}

.task-row {
  width: 100%;
  min-height: 72px;
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  text-align: left;
}

.task-row:hover:not(:disabled) {
  border-color: #10b981;
}

.task-row.done {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.task-row:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.check-icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f3f4f6;
  color: #10b981;
}

.task-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.task-status {
  font-size: 0.8rem;
  font-weight: 700;
  color: #047857;
}

.stat-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-list div {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.stat-list strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.25rem;
}

.skill-breakdown {
  margin-top: 1.25rem;
}

.skill-breakdown h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.skill-row {
  display: grid;
  grid-template-columns: 80px 1fr 44px;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.mini-track {
  height: 0.5rem;
}

.mini-fill {
  height: 100%;
  background: #f59e0b;
}

.state-panel {
  display: grid;
  place-items: center;
  min-height: 240px;
  text-align: center;
}

.state-panel.error {
  color: #991b1b;
}

.state-panel button {
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #111827;
  color: white;
  cursor: pointer;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .practice-header,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .practice-header {
    display: grid;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .practice-page {
    padding: 1rem;
  }

  .summary-grid,
  .stat-list {
    grid-template-columns: 1fr;
  }

  .task-row {
    grid-template-columns: 36px 1fr;
  }

  .task-status {
    grid-column: 2;
  }
}
</style>
