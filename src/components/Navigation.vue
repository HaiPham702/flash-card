<script setup lang="ts">
import { buildLocation } from '@/router/nav'
</script>

<template>
  <router-link :to="buildLocation('speaking')" class="nav-link">
    <i class="fas fa-microphone"></i>
    Speaking Topics
  </router-link>

  <router-link :to="buildLocation('attendance')" class="nav-link">
    <i class="fas fa-calendar-check"></i>
    <span>Điểm danh</span>
  </router-link>
</template>
