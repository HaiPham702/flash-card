<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import Notifications from './components/Notifications.vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <Notifications />

  <nav class="navbar">
    <router-link to="/" class="logo">
      Flash Card
    </router-link>
    <div class="nav-links">
      <template v-if="authStore.isAuthenticated">
        <router-link to="/decks">Bộ thẻ</router-link>
        <router-link to="/speaking">Speaking</router-link>
        <router-link to="/writing">Writing</router-link>
        <router-link to="/attendance">Điểm danh</router-link>
        <div class="user-menu">
          <span class="user-name">{{ authStore.currentUser?.name }}</span>
          <button @click="handleLogout" class="logout-button">
            Đăng xuất
          </button>
        </div>
      </template>
      <template v-else>
        <router-link to="/login" class="login-button">
          <div style="color: white;">
            Đăng nhập
          </div>
        </router-link>
      </template>
    </div>
  </nav>

  <router-view></router-view>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary-color: #6366f1;
  --text-color: #374151;
  --background-color: #f9fafb;
  --border-color: #e5e7eb;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.5;
}

.navbar {
  background-color: white;
  padding: 1rem 2rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--primary-color);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
  color: var(--text-color);
}

.login-button,
.logout-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-button {
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
}

.login-button:hover {
  background-color: #4f46e5;
}

.logout-button {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.logout-button:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}
</style>
