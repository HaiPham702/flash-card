<template>
  <main class="admin-page">
    <section class="admin-header">
      <div>
        <p class="eyebrow">Practice admin</p>
        <h1>Weekly practice overview</h1>
      </div>
      <button class="primary-button" :disabled="isLoading" @click="loadData">
        <i class="fas fa-rotate"></i>
        Refresh
      </button>
    </section>

    <section class="filters">
      <label>
        Week
        <input v-model.number="filters.weekNo" type="number" min="1" max="53" />
      </label>
      <label>
        Year
        <input v-model.number="filters.year" type="number" min="2020" />
      </label>
      <label>
        Skill
        <select v-model="filters.skill">
          <option value="">All skills</option>
          <option v-for="item in settings?.template || []" :key="item.skillType" :value="item.skillType">
            {{ item.label || item.skillType }}
          </option>
        </select>
      </label>
      <label>
        Status
        <select v-model="filters.status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="finalized">Finalized</option>
        </select>
      </label>
    </section>

    <section class="overview-panel">
      <div class="section-title">
        <h2>Week {{ overviewWeek?.weekNo || filters.weekNo }} - {{ overviewWeek?.year || filters.year }}</h2>
        <span>{{ rows.length }} users</span>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Progress</th>
              <th>Missing</th>
              <th>Penalty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5">Loading overview...</td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td colspan="5">No data found.</td>
            </tr>
            <template v-else>
              <tr v-for="row in rows" :key="row.weeklyId">
                <td>
                  <strong>{{ row.user?.name || 'Unknown' }}</strong>
                  <small>{{ row.user?.email }}</small>
                </td>
                <td>{{ row.progress }}</td>
                <td>{{ row.missing }}</td>
                <td>{{ formatCurrency(row.penalty) }}</td>
                <td><span class="status-pill">{{ row.status }}</span></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <section class="config-grid">
      <form class="config-panel" @submit.prevent="saveSettings">
        <div class="section-title">
          <h2>Penalty settings</h2>
        </div>
        <label>
          Base penalty
          <input v-model.number="settingsForm.basePenalty" type="number" min="0" step="1000" />
        </label>
        <label>
          Increment penalty
          <input v-model.number="settingsForm.incrementalPenalty" type="number" min="0" step="1000" />
        </label>
        <label>
          Max penalty per week
          <input v-model.number="settingsForm.maxPenalty" type="number" min="0" step="1000" />
        </label>
        <div class="deadline-grid">
          <label>
            Deadline day
            <select v-model.number="settingsForm.deadlineDayOfWeek">
              <option :value="0">Sunday</option>
              <option :value="1">Monday</option>
              <option :value="2">Tuesday</option>
              <option :value="3">Wednesday</option>
              <option :value="4">Thursday</option>
              <option :value="5">Friday</option>
              <option :value="6">Saturday</option>
            </select>
          </label>
          <label>
            Hour
            <input v-model.number="settingsForm.deadlineHour" type="number" min="0" max="23" />
          </label>
          <label>
            Minute
            <input v-model.number="settingsForm.deadlineMinute" type="number" min="0" max="59" />
          </label>
        </div>
        <button class="primary-button" :disabled="isSavingSettings">
          <i class="fas fa-floppy-disk"></i>
          Save settings
        </button>
      </form>

      <form class="config-panel" @submit.prevent="saveTemplate">
        <div class="section-title">
          <h2>Checklist template</h2>
          <button type="button" class="ghost-button" @click="addTemplateItem">
            <i class="fas fa-plus"></i>
            Add skill
          </button>
        </div>

        <div class="template-list">
          <div v-for="(item, index) in templateForm" :key="index" class="template-row">
            <input v-model="item.label" placeholder="Label" />
            <input v-model="item.skillType" placeholder="skill_type" />
            <input v-model.number="item.sessions" type="number" min="1" max="20" />
            <label class="toggle-label">
              <input v-model="item.enabled" type="checkbox" />
              On
            </label>
            <button type="button" class="icon-button" @click="removeTemplateItem(index)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <button class="primary-button" :disabled="isSavingTemplate">
          <i class="fas fa-floppy-disk"></i>
          Save template
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { practiceApi, type AdminOverviewRow, type PenaltySettings, type PracticeTemplateItem } from '@/api/practice'
import { useNotificationStore } from '@/stores/notification'

const notification = useNotificationStore()
const isLoading = ref(false)
const isSavingSettings = ref(false)
const isSavingTemplate = ref(false)
const rows = ref<AdminOverviewRow[]>([])
const settings = ref<PenaltySettings | null>(null)
const overviewWeek = ref<{ weekNo: number; year: number } | null>(null)
const templateForm = ref<PracticeTemplateItem[]>([])

const now = new Date()
const filters = reactive({
  weekNo: undefined as number | undefined,
  year: now.getFullYear(),
  skill: '',
  status: ''
})

const settingsForm = reactive({
  basePenalty: 20000,
  incrementalPenalty: 5000,
  maxPenalty: 1000000,
  deadlineDayOfWeek: 0,
  deadlineHour: 23,
  deadlineMinute: 59
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

function syncSettingsForm(next: PenaltySettings) {
  settingsForm.basePenalty = next.basePenalty
  settingsForm.incrementalPenalty = next.incrementalPenalty
  settingsForm.maxPenalty = next.maxPenalty
  settingsForm.deadlineDayOfWeek = next.deadlineDayOfWeek
  settingsForm.deadlineHour = next.deadlineHour
  settingsForm.deadlineMinute = next.deadlineMinute
  templateForm.value = next.template.map(item => ({ ...item }))
}

async function loadData() {
  isLoading.value = true
  try {
    const [overview, nextSettings] = await Promise.all([
      practiceApi.getAdminOverview(filters),
      practiceApi.getSettings()
    ])
    rows.value = overview.rows
    overviewWeek.value = overview.week
    settings.value = nextSettings
    syncSettingsForm(nextSettings)
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Cannot load admin overview')
  } finally {
    isLoading.value = false
  }
}

async function saveSettings() {
  isSavingSettings.value = true
  try {
    const next = await practiceApi.updateSettings({ ...settingsForm })
    settings.value = next
    syncSettingsForm(next)
    notification.success('Penalty settings saved')
    await loadData()
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Cannot save settings')
  } finally {
    isSavingSettings.value = false
  }
}

async function saveTemplate() {
  isSavingTemplate.value = true
  try {
    const cleaned = templateForm.value
      .filter(item => item.skillType.trim())
      .map(item => ({
        ...item,
        skillType: item.skillType.trim().toLowerCase(),
        label: item.label.trim() || item.skillType.trim(),
        sessions: Number(item.sessions) || 1
      }))
    const next = await practiceApi.updateTemplate(cleaned)
    settings.value = next
    syncSettingsForm(next)
    notification.success('Checklist template saved')
  } catch (error) {
    notification.error(error instanceof Error ? error.message : 'Cannot save template')
  } finally {
    isSavingTemplate.value = false
  }
}

function addTemplateItem() {
  templateForm.value.push({ skillType: '', label: '', sessions: 1, enabled: true })
}

function removeTemplateItem(index: number) {
  templateForm.value.splice(index, 1)
}

watch(filters, loadData, { deep: true })
onMounted(loadData)
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header,
.section-title,
.filters {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-header,
.section-title {
  justify-content: space-between;
}

.admin-header {
  margin-bottom: 1.5rem;
}

.eyebrow {
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1,
h2 {
  color: #111827;
}

h1 {
  font-size: 2rem;
}

h2 {
  font-size: 1.15rem;
}

.filters,
.overview-panel,
.config-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.filters {
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 600;
}

input,
select {
  min-height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.55rem 0.7rem;
  color: #111827;
  background: white;
}

.overview-panel {
  margin-bottom: 1rem;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;
}

th,
td {
  padding: 0.85rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

th {
  color: #6b7280;
  font-size: 0.8rem;
  text-transform: uppercase;
}

td small {
  display: block;
  color: #6b7280;
}

.status-pill {
  display: inline-flex;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 0.8rem;
  font-weight: 700;
}

.config-grid {
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.config-panel {
  display: grid;
  gap: 0.85rem;
}

.deadline-grid {
  display: grid;
  grid-template-columns: 1fr 90px 90px;
  gap: 0.75rem;
}

.template-list {
  display: grid;
  gap: 0.75rem;
}

.template-row {
  display: grid;
  grid-template-columns: 1fr 1fr 84px 72px 42px;
  gap: 0.5rem;
  align-items: center;
}

.toggle-label {
  display: inline-flex;
  grid-auto-flow: column;
  align-items: center;
  gap: 0.35rem;
}

.primary-button,
.ghost-button,
.icon-button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 700;
}

.primary-button {
  border: 0;
  padding: 0.55rem 1rem;
  background: #111827;
  color: white;
}

.ghost-button,
.icon-button {
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
}

.ghost-button {
  padding: 0.5rem 0.8rem;
}

.icon-button {
  width: 42px;
  color: #b91c1c;
}

button:disabled {
  cursor: wait;
  opacity: 0.65;
}

@media (max-width: 920px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .admin-page {
    padding: 1rem;
  }

  .admin-header,
  .section-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .deadline-grid,
  .template-row {
    grid-template-columns: 1fr;
  }
}
</style>
