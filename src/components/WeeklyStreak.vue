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
  transition: all 0.3s ease;
}

.weekly-streak:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff9800, #ff5722);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.streak-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 152, 0, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.streak-info:hover {
  background: rgba(255, 152, 0, 0.15);
}

.streak-info i {
  color: #ff9800;
  font-size: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.streak-count {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ff9800;
  text-shadow: 0 2px 4px rgba(255, 152, 0, 0.2);
}

.streak-label {
  color: #666;
  font-weight: 500;
}

.streak-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.value {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
}
</style> 