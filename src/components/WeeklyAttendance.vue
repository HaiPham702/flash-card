<template>
  <div class="weekly-attendance">
    <div class="card">
      <div class="card-header">
        <h3>Điểm danh tuần này</h3>
        <span class="count">{{ weeklyAttendanceCount }}/7 ngày</span>
      </div>
      <div class="attendance-grid">
        <div
          v-for="day in 7"
          :key="day"
          class="day-cell"
          :class="{ attended: isAttended(day) }"
        >
          {{ getDayName(day) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAttendanceStore } from '../stores/attendance';
import { format, startOfWeek, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';

const store = useAttendanceStore();
const weeklyAttendanceCount = computed(() => store.weeklyAttendanceCount);

onMounted(async () => {
  await store.fetchWeeklyAttendance();
});

const isAttended = (day: number) => {
  const weekStart = startOfWeek(new Date());
  const targetDate = addDays(weekStart, day - 1);
  return store.weeklyAttendance.some(
    attendance => format(new Date(attendance.date), 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd')
  );
};

const getDayName = (day: number) => {
  const weekStart = startOfWeek(new Date());
  const targetDate = addDays(weekStart, day - 1);
  return format(targetDate, 'EEE', { locale: vi });
};
</script>

<style scoped>
.weekly-attendance {
  margin: 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.count {
  font-weight: bold;
  color: #4CAF50;
}

.attendance-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f5f5f5;
  font-size: 0.9rem;
  color: #666;
}

.day-cell.attended {
  background: #4CAF50;
  color: white;
}
</style> 