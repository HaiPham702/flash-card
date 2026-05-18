import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { DEFAULT_VIEW, PUBLIC_VIEWS, type ViewName } from './nav'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      name: 'root',
      component: () => import('../views/RootView.vue')
    }
  ]
})

function getView(to: RouteLocationNormalized): ViewName {
  const v = to.query.view
  return (typeof v === 'string' ? (v as ViewName) : DEFAULT_VIEW) || DEFAULT_VIEW
}

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const view = getView(to)
  const isPublic = PUBLIC_VIEWS.includes(view)

  if (to.path !== '/') {
    return next({ path: '/', query: to.query })
  }

  if (!isPublic && !authStore.isAuthenticated) {
    return next({ path: '/', query: { view: 'login', redirect: view } })
  }

  if (isPublic && authStore.isAuthenticated) {
    return next({ path: '/', query: { view: 'home' } })
  }

  next()
})

export default router
