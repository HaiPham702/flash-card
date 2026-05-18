<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { onMounted, onUnmounted, ref } from 'vue'
import Notifications from './components/Notifications.vue'
import { useNav, buildLocation } from './router/nav'

const authStore = useAuthStore()
const { goTo } = useNav()
const navbarRef = ref<HTMLElement | null>(null)

const closeSubmenus = () => {
  navbarRef.value?.querySelectorAll<HTMLDetailsElement>('.nav-menu[open]').forEach((menu) => {
    menu.open = false
  })
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!navbarRef.value?.contains(event.target as Node)) {
    closeSubmenus()
  }
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeSubmenus()
  }
}

const handleMenuToggle = (event: Event) => {
  const currentMenu = event.currentTarget as HTMLDetailsElement
  if (!currentMenu.open) return

  navbarRef.value?.querySelectorAll<HTMLDetailsElement>('.nav-menu[open]').forEach((menu) => {
    if (menu !== currentMenu) {
      menu.open = false
    }
  })
}

onMounted(() => {
  authStore.initializeAuth()
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})

const handleLogout = () => {
  authStore.logout()
  goTo('login')
}
</script>

<template>
  <Notifications />

  <nav ref="navbarRef" class="navbar">
    <router-link :to="buildLocation('decks')" class="logo">
      Flash Card
    </router-link>

    <div class="nav-links">
      <template v-if="authStore.isAuthenticated">
        <router-link :to="buildLocation('decks')" class="top-link">
          <i class="fas fa-layer-group"></i>
          Bộ thẻ
        </router-link>

        <details class="nav-menu" @toggle="handleMenuToggle">
          <summary>
            <i class="fas fa-book-open"></i>
            Luyện IELTS
            <i class="fas fa-chevron-down chevron"></i>
          </summary>
          <div class="submenu">
            <router-link :to="buildLocation('grammar')" @click="closeSubmenus">
              <i class="fas fa-spell-check"></i>
              Ngữ pháp
            </router-link>
            <router-link :to="buildLocation('speaking')" @click="closeSubmenus">
              <i class="fas fa-microphone"></i>
              Speaking
            </router-link>
            <router-link :to="buildLocation('writing')" @click="closeSubmenus">
              <i class="fas fa-pen-nib"></i>
              Writing
            </router-link>
          </div>
        </details>

        <details class="nav-menu" @toggle="handleMenuToggle">
          <summary>
            <i class="fas fa-chart-line"></i>
            Theo dõi
            <i class="fas fa-chevron-down chevron"></i>
          </summary>
          <div class="submenu">
            <router-link :to="buildLocation('weekly-practice')" @click="closeSubmenus">
              <i class="fas fa-list-check"></i>
              Weekly Tracker
            </router-link>
            <router-link :to="buildLocation('attendance')" @click="closeSubmenus">
              <i class="fas fa-calendar-check"></i>
              Điểm danh
            </router-link>
          </div>
        </details>

        <details class="nav-menu" @toggle="handleMenuToggle">
          <summary>
            <i class="fas fa-screwdriver-wrench"></i>
            Công cụ
            <i class="fas fa-chevron-down chevron"></i>
          </summary>
          <div class="submenu submenu-right">
            <router-link :to="buildLocation('telegram')" @click="closeSubmenus">
              <i class="fas fa-robot"></i>
              Telegram Bot
            </router-link>
            <router-link :to="buildLocation('weekly-practice-admin')" @click="closeSubmenus">
              <i class="fas fa-table-columns"></i>
              Practice Admin
            </router-link>
          </div>
        </details>

        <div class="user-menu">
          <span class="user-name">{{ authStore.currentUser?.name }}</span>
          <button @click="handleLogout" class="logout-button">
            Đăng xuất
          </button>
        </div>
      </template>

      <template v-else>
        <router-link :to="buildLocation('login')" class="login-button">
          Đăng nhập
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
  padding: 0.85rem 2rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  text-decoration: none;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
}

.nav-links a,
.nav-menu summary {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
}

.top-link,
.nav-menu summary {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a.router-link-active,
.nav-menu[open] summary,
.nav-menu summary:hover {
  color: var(--primary-color);
  background-color: #f5f7ff;
}

.nav-menu {
  position: relative;
}

.nav-menu summary {
  list-style: none;
  cursor: pointer;
  user-select: none;
}

.nav-menu summary::-webkit-details-marker {
  display: none;
}

.chevron {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.nav-menu[open] .chevron {
  transform: rotate(180deg);
}

.submenu {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  width: 220px;
  padding: 0.45rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 16px 32px rgb(15 23 42 / 0.12);
  display: grid;
  gap: 0.2rem;
}

.submenu-right {
  left: auto;
  right: 0;
}

.submenu a {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.45rem;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 0.5rem;
  padding-left: 1rem;
  border-left: 1px solid var(--border-color);
}

.user-name {
  font-weight: 500;
  color: var(--text-color);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

@media (max-width: 900px) {
  .navbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 0.85rem 1rem;
  }

  .nav-links {
    width: 100%;
    flex-wrap: wrap;
  }

  .user-menu {
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
    padding-left: 0;
    padding-top: 0.75rem;
    border-left: 0;
    border-top: 1px solid var(--border-color);
  }
}

@media (max-width: 560px) {
  .top-link,
  .nav-menu {
    width: 100%;
  }

  .top-link,
  .nav-menu summary {
    width: 100%;
    justify-content: space-between;
  }

  .submenu,
  .submenu-right {
    position: static;
    width: 100%;
    margin-top: 0.35rem;
    box-shadow: none;
  }
}
</style>
