<template>
  <div class="attendance-view">
    <h2>Điểm danh học tập</h2>
    
    <div class="attendance-container">
      <div class="left-column">
        <WeeklyStreak />
        <WeeklyAttendance />
      </div>
      <MonthlyAttendance />
    </div>
  </div>
</template>

<script setup lang="ts">
import WeeklyAttendance from '../components/WeeklyAttendance.vue';
import MonthlyAttendance from '../components/MonthlyAttendance.vue';
import WeeklyStreak from '../components/WeeklyStreak.vue';
</script>

<style scoped>
.attendance-view {
  padding: 2rem;
}

.attendance-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-top: 2rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .attendance-container {
    grid-template-columns: 1fr;
  }
}
</style> 