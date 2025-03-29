import { defineStore } from 'pinia';
import { apiRequest } from '../api';

interface Attendance {
  _id: string;
  userId: string;
  deckId: string;
  date: string;
  completed: boolean;
}

interface MonthlyAttendanceDay {
  day: number;
  attended: boolean;
  attendance: Attendance | null;
}

interface AttendanceState {
  weeklyAttendance: Attendance[];
  monthlyAttendance: MonthlyAttendanceDay[];
  loading: boolean;
  error: string | null;
}

export const useAttendanceStore = defineStore('attendance', {
  state: (): AttendanceState => ({
    weeklyAttendance: [],
    monthlyAttendance: [],
    loading: false,
    error: null
  }),

  actions: {
    async markAttendance(deckId: string) {
      try {
        this.loading = true;
        await apiRequest('/attendance/mark', 'POST', { deckId });
        this.error = null;
      } catch (error: any) {
        this.error = error.message || 'Có lỗi xảy ra';
      } finally {
        this.loading = false;
      }
    },

    async fetchWeeklyAttendance() {
      try {
        this.loading = true;
        const data = await apiRequest('/attendance/weekly') as Attendance[];
        this.weeklyAttendance = data;
        this.error = null;
      } catch (error: any) {
        this.error = error.message || 'Có lỗi xảy ra';
      } finally {
        this.loading = false;
      }
    },

    async fetchMonthlyAttendance(month: number, year: number) {
      try {
        this.loading = true;
        const queryParams = new URLSearchParams({
          month: month.toString(),
          year: year.toString()
        });
        const data = await apiRequest(`/attendance/monthly?${queryParams.toString()}`) as MonthlyAttendanceDay[];
        this.monthlyAttendance = data;
        this.error = null;
      } catch (error: any) {
        this.error = error.message || 'Có lỗi xảy ra';
      } finally {
        this.loading = false;
      }
    }
  },

  getters: {
    weeklyAttendanceCount: (state) => state.weeklyAttendance.length,
    monthlyAttendanceCount: (state) => state.monthlyAttendance.filter(day => day.attended).length
  }
}); 