import { apiRequest } from './index'

export interface WeeklyPractice {
  _id: string
  weekNo: number
  year: number
  weekStart: string
  weekEnd: string
  totalTasks: number
  completedTasks: number
  penaltyAmount: number
  status: 'active' | 'finalized'
  finalizedAt?: string | null
}

export interface WeeklyPracticeTask {
  _id: string
  weeklyPracticeId: string
  skillType: string
  sessionNo: number
  label: string
  isCompleted: boolean
  completedAt?: string | null
}

export interface PracticeTemplateItem {
  skillType: string
  sessions: number
  enabled: boolean
  label: string
}

export interface PenaltySettings {
  _id?: string
  basePenalty: number
  incrementalPenalty: number
  maxPenalty: number
  deadlineDayOfWeek: number
  deadlineHour: number
  deadlineMinute: number
  template: PracticeTemplateItem[]
}

export interface PracticeStats {
  perfectWeeks: number
  currentStreak: number
  monthlyPenalty: number
  worstSkill: string | null
  totalWeeks: number
  skillStats: Record<string, { total: number; missed: number }>
}

export interface AdminOverviewRow {
  weeklyId: string
  user: { _id: string; name: string; email: string }
  weekNo: number
  year: number
  progress: string
  missing: number
  penalty: number
  status: string
}

export const practiceApi = {
  getCurrentWeek: () =>
    apiRequest('/practice/week/current') as Promise<{ week: WeeklyPractice; tasks: WeeklyPracticeTask[] }>,

  completeTask: (id: string) =>
    apiRequest(`/practice/task/${id}/complete`, 'POST') as Promise<{ week: WeeklyPractice; task: WeeklyPracticeTask }>,

  uncompleteTask: (id: string) =>
    apiRequest(`/practice/task/${id}/uncomplete`, 'POST') as Promise<{ week: WeeklyPractice; task: WeeklyPracticeTask }>,

  getStats: () => apiRequest('/practice/stats') as Promise<PracticeStats>,

  getSettings: () => apiRequest('/practice/settings') as Promise<PenaltySettings>,

  getAdminOverview: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value))
    })
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return apiRequest(`/practice/admin/overview${suffix}`) as Promise<{ week: { weekNo: number; year: number }; rows: AdminOverviewRow[] }>
  },

  updateSettings: (data: Partial<PenaltySettings>) =>
    apiRequest('/practice/admin/settings', 'PUT', data) as Promise<PenaltySettings>,

  updateTemplate: (template: PracticeTemplateItem[]) =>
    apiRequest('/practice/admin/template', 'PUT', { template }) as Promise<PenaltySettings>
}
