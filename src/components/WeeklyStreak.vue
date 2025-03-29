<template>
  <div class="weekly-streak" @click="goToAttendance">
    <div class="card">
      <div class="card-header">
        <h3>Chuỗi tuần học tập</h3>
        <div class="streak-info">
          <i class="fas fa-fire"></i>
          <span class="streak-count">{{ currentStreak }}</span>
          <span class="streak-label">tuần</span>
        </div>
      </div>
      
      <div class="streak-details">
        <div class="detail-item">
          <span class="label">Tuần hiện tại</span>
          <span class="value">{{ weeklyAttendanceCount }}/7 ngày</span>
        </div>
        <div class="detail-item">
          <span class="label">Chuỗi dài nhất</span>
          <span class="value">{{ longestStreak }} tuần</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAttendanceStore } from '../stores/attendance';

const router = useRouter();
const store = useAttendanceStore();

const weeklyAttendanceCount = computed(() => store.weeklyAttendanceCount);

// Tính toán chuỗi tuần hiện tại
const currentStreak = computed(() => {
  const attendance = store.weeklyAttendance;
  if (attendance.length === 0) return 0;
  
  // Sắp xếp theo ngày
  const sortedAttendance = [...attendance].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Kiểm tra xem có phải là tuần liên tiếp không
  let streak = 1;
  let currentWeek = new Date(sortedAttendance[0].date);
  
  for (let i = 1; i < sortedAttendance.length; i++) {
    const nextDate = new Date(sortedAttendance[i].date);
    const weekDiff = Math.floor((nextDate.getTime() - currentWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekDiff === 1) {
      streak++;
      currentWeek = nextDate;
    } else {
      break;
    }
  }
  
  return streak;
});

// Tính toán chuỗi tuần dài nhất
const longestStreak = computed(() => {
  const attendance = store.weeklyAttendance;
  if (attendance.length === 0) return 0;
  
  // Sắp xếp theo ngày
  const sortedAttendance = [...attendance].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let maxStreak = 1;
  let currentStreak = 1;
  let currentWeek = new Date(sortedAttendance[0].date);
  
  for (let i = 1; i < sortedAttendance.length; i++) {
    const nextDate = new Date(sortedAttendance[i].date);
    const weekDiff = Math.floor((nextDate.getTime() - currentWeek.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
      currentWeek = nextDate;
    } else {
      currentStreak = 1;
      currentWeek = nextDate;
    }
  }
  
  return maxStreak;
});

const goToAttendance = () => {
  router.push('/attendance');
};
</script>

<style scoped>
.weekly-streak {
  margin: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.weekly-streak:hover {
  transform: translateY(-2px);
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

.streak-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.streak-info i {
  color: #ff9800;
  font-size: 1.5rem;
}

.streak-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff9800;
}

.streak-label {
  color: #666;
}

.streak-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  font-weight: bold;
  color: #333;
}
</style> 