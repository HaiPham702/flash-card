import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import SpeakingView from '@/views/SpeakingView.vue'
import AttendanceView from '../views/AttendanceView.vue'
import WritingView from '../views/WritingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/decks',
      name: 'decks',
      component: () => import('../views/DeckListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/deck/:id',
      name: 'deck-detail',
      component: () => import('../views/DeckDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/study/:deckId',
      name: 'study',
      component: () => import('../views/StudyView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/test/:deckId',
      name: 'test',
      component: () => import('../views/TestView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/speaking',
      name: 'speaking',
      component: SpeakingView
    },
    {
      path: '/attendance',
      name: 'attendance',
      component: AttendanceView,
      meta: { requiresAuth: true }
    },
    {
      path: '/writing',
      name: 'writing',
      component: WritingView,
      meta: {
        title: 'IELTS Writing Practice'
      }
    },
    // Grammar feature routes
    {
      path: '/grammar',
      name: 'grammar',
      component: () => import('../views/GrammarView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/grammar/topic/:topicId',
      name: 'grammar-topic',
      component: () => import('../views/GrammarTopicView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/grammar/practice/:categoryId',
      name: 'grammar-practice-category',
      component: () => import('../views/GrammarPracticeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/grammar/practice/day/:dayId',
      name: 'grammar-practice-day',
      component: () => import('../views/GrammarPracticeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/grammar/flashcards/:dayId',
      name: 'grammar-flashcards',
      component: () => import('../views/GrammarFlashcardsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/telegram',
      name: 'telegram-management',
      component: () => import('../views/TelegramManagementView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
