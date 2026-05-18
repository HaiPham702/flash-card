<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue'
import { useNav, type ViewName } from '@/router/nav'

const LoginView = defineAsyncComponent(() => import('./LoginView.vue'))
const RegisterView = defineAsyncComponent(() => import('./RegisterView.vue'))
const HomeView = defineAsyncComponent(() => import('./HomeView.vue'))
const DeckListView = defineAsyncComponent(() => import('./DeckListView.vue'))
const DeckDetailView = defineAsyncComponent(() => import('./DeckDetailView.vue'))
const StudyView = defineAsyncComponent(() => import('./StudyView.vue'))
const TestView = defineAsyncComponent(() => import('./TestView.vue'))
const SpeakingView = defineAsyncComponent(() => import('./SpeakingView.vue'))
const AttendanceView = defineAsyncComponent(() => import('./AttendanceView.vue'))
const WritingView = defineAsyncComponent(() => import('./WritingView.vue'))
const GrammarView = defineAsyncComponent(() => import('./GrammarView.vue'))
const GrammarTopicView = defineAsyncComponent(() => import('./GrammarTopicView.vue'))
const GrammarPracticeView = defineAsyncComponent(() => import('./GrammarPracticeView.vue'))
const GrammarFlashcardsView = defineAsyncComponent(() => import('./GrammarFlashcardsView.vue'))
const TelegramManagementView = defineAsyncComponent(() => import('./TelegramManagementView.vue'))
const WeeklyPracticeView = defineAsyncComponent(() => import('./WeeklyPracticeView.vue'))
const WeeklyPracticeAdminView = defineAsyncComponent(() => import('./WeeklyPracticeAdminView.vue'))

const viewMap: Record<ViewName, Component> = {
  login: LoginView,
  register: RegisterView,
  home: HomeView,
  decks: DeckListView,
  'deck-detail': DeckDetailView,
  study: StudyView,
  test: TestView,
  speaking: SpeakingView,
  attendance: AttendanceView,
  writing: WritingView,
  grammar: GrammarView,
  'grammar-topic': GrammarTopicView,
  'grammar-practice': GrammarPracticeView,
  'grammar-flashcards': GrammarFlashcardsView,
  telegram: TelegramManagementView,
  'weekly-practice': WeeklyPracticeView,
  'weekly-practice-admin': WeeklyPracticeAdminView
}

const { currentView } = useNav()

const ActiveComponent = computed<Component>(() => viewMap[currentView.value] || DeckListView)
const viewKey = computed(() => currentView.value)
</script>

<template>
  <component :is="ActiveComponent" :key="viewKey" />
</template>
