import { computed } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw, type RouteLocationRaw } from 'vue-router'

export type ViewName =
  | 'login'
  | 'register'
  | 'home'
  | 'decks'
  | 'deck-detail'
  | 'study'
  | 'test'
  | 'speaking'
  | 'attendance'
  | 'writing'
  | 'grammar'
  | 'grammar-topic'
  | 'grammar-practice'
  | 'grammar-flashcards'
  | 'telegram'
  | 'weekly-practice'
  | 'weekly-practice-admin'

export const DEFAULT_VIEW: ViewName = 'decks'

export const PUBLIC_VIEWS: ViewName[] = ['login', 'register']

export function buildLocation(view: ViewName, params: Record<string, string | number | undefined> = {}): RouteLocationRaw {
  const query: LocationQueryRaw = { view }
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    query[key] = String(value)
  }
  return { path: '/', query }
}

export function useNav() {
  const router = useRouter()
  const route = useRoute()

  const currentView = computed<ViewName>(() => {
    const v = route.query.view
    return (typeof v === 'string' ? (v as ViewName) : DEFAULT_VIEW) || DEFAULT_VIEW
  })

  function goTo(view: ViewName, params: Record<string, string | number | undefined> = {}) {
    return router.push(buildLocation(view, params))
  }

  function replaceWith(view: ViewName, params: Record<string, string | number | undefined> = {}) {
    return router.replace(buildLocation(view, params))
  }

  function param(name: string): string {
    const v = route.query[name]
    if (Array.isArray(v)) return v[0] ?? ''
    return v ?? ''
  }

  return { currentView, goTo, replaceWith, param, buildLocation }
}

export function useQueryParam(name: string) {
  const route = useRoute()
  return computed(() => {
    const v = route.query[name]
    if (Array.isArray(v)) return v[0] ?? ''
    return (v as string) ?? ''
  })
}
