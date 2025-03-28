<template>
  <div class="speaking-view">
    <div class="header">
      <h1>IELTS Speaking Topics</h1>
      <router-link to="/" class="back-button">
        <i class="fas fa-arrow-left"></i> Quay lại trang chủ
      </router-link>
    </div>

    <SpeakingTopic />
  </div>
</template>

<script setup lang="ts">
import SpeakingTopic from '@/components/SpeakingTopic.vue'
</script>

<style scoped>
.speaking-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #1f2937;
  font-size: 2rem;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #e5e7eb;
}
</style> 