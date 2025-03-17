import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/decks',
      name: 'decks',
      component: () => import('../views/DeckListView.vue')
    },
    {
      path: '/deck/:id',
      name: 'deck-detail',
      component: () => import('../views/DeckDetailView.vue')
    },
    {
      path: '/study/:deckId',
      name: 'study',
      component: () => import('../views/StudyView.vue')
    },
    {
      path: '/test/:deckId',
      name: 'test',
      component: () => import('../views/TestView.vue')
    }
  ]
})

export default router
