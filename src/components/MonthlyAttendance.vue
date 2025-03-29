<template>
  <div class="monthly-attendance">
    <div class="card">
      <div class="card-header">
        <h3>Điểm danh tháng {{ currentMonth }}</h3>
        <div class="controls">
          <button @click="previousMonth">&lt;</button>
          <span>{{ format(currentDate, 'MMMM yyyy', { locale: vi }) }}</span>
          <button @click="nextMonth">&gt;</button>
        </div>
      </div>
      
      <div class="calendar">
        <div class="weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        </div>
        
        <div class="days">
          <div
            v-for="day in calendarDays"
            :key="format(day.date, 'yyyy-MM-dd')"
            class="day"
            :class="{
              'other-month': !day.currentMonth,
              'attended': day.attended,
              'today': isTodayDate(day.date)
            }"
          >
            <span class="day-number">{{ day.dayNumber }}</span>
            <div v-if="day.attended" class="attendance-indicator"></div>
          </div>
        </div>
      </div>
      
      <div class="summary">
        <p>Tổng số ngày đã học: {{ monthlyAttendanceCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAttendanceStore } from '../stores/attendance';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

const store = useAttendanceStore();
const currentDate = ref(new Date());
const monthlyAttendanceCount = computed(() => store.monthlyAttendanceCount);

const currentMonth = computed(() => format(currentDate.value, 'MM/yyyy'));

const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value);
  const end = endOfMonth(currentDate.value);
  const days = eachDayOfInterval({ start, end });
  
  return days.map(day => {
    const dayNumber = day.getDate();
    const attendance = store.monthlyAttendance.find(
      a => a.day === dayNumber
    );
    
    return {
      date: day,
      dayNumber: format(day, 'd'),
      currentMonth: isSameMonth(day, currentDate.value),
      attended: attendance?.attended || false
    };
  });
});

const previousMonth = async () => {
  currentDate.value = subMonths(currentDate.value, 1);
  await fetchMonthlyAttendance();
};

const nextMonth = async () => {
  currentDate.value = addMonths(currentDate.value, 1);
  await fetchMonthlyAttendance();
};

const isTodayDate = (date: Date) => {
  return isToday(date);
};

const fetchMonthlyAttendance = async () => {
  const month = currentDate.value.getMonth() + 1;
  const year = currentDate.value.getFullYear();
  await store.fetchMonthlyAttendance(month, year);
};

onMounted(async () => {
  await fetchMonthlyAttendance();
});
</script>

<style scoped>
.monthly-attendance {
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

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.controls button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
}

.calendar {
  margin-bottom: 1rem;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: bold;
  color: #666;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f5f5f5;
  position: relative;
}

.day.other-month {
  color: #ccc;
}

.day.attended {
  background: #4CAF50;
  color: white;
}

.day.today {
  border: 2px solid #2196F3;
}

.attendance-indicator {
  position: absolute;
  bottom: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}

.summary {
  text-align: center;
  color: #666;
}
</style> 