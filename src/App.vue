<template>
  <div>
    <v-layout class="rounded rounded-md">
      <v-navigation-drawer>
        <v-list>
          <v-list-item title="Navigation drawer"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar title="Application bar"></v-app-bar>

      <v-main class="d-flex align-center justify-center" style="min-height: 300px">
        Love you 3000 times "Thuy Duong ❤️❤️❤️"
      </v-main>
    </v-layout>
  </div>
</template>

<script setup>
import HelloWorld from './components/HelloWorld.vue'
// import { useUserStore } from '@/stores/user.js';
// import { cards, loading, useCardStore } from '@/stores/card.js';
import { onMounted } from 'vue';

// const userStore = useUserStore();
// const cardStore = useCardStore();

onMounted(() => {
  // userStore.fetchUsers(); 
  // cardStore.fetchCards();
});
</script>

<style scoped></style>
