<template>
  <div class="deck-list">
    <div class="header">
      <h1>Bộ thẻ của bạn</h1>
      <button @click="showCreateDeckModal = true" class="create-button" :disabled="isLoading">
        <i class="fas fa-plus"></i> Tạo bộ thẻ mới
      </button>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Đang tải bộ thẻ...</p>
    </div>

    <div v-else-if="decks.length === 0" class="empty-state">
      <i class="fas fa-folder-open"></i>
      <p>Bạn chưa có bộ thẻ nào</p>
      <button @click="showCreateDeckModal = true" class="create-button">
        <i class="fas fa-plus"></i> Tạo bộ thẻ đầu tiên
      </button>
    </div>

    <div v-else class="decks-grid">
      <div v-for="(deck, index) in decks" :key="`${deck._id}-${index}`" class="deck-card">
        <div class="deck-info">
          <h3>{{ deck.name }}</h3>
          <p>{{ deck.description }}</p>
          <div class="deck-stats">
            <span><i class="fa-solid fa-cards-blank"></i> {{ deck.cards.length }} thẻ</span>
            <span><i class="fas fa-clock"></i> {{ deck.dueCards }} thẻ cần ôn tập</span>
          </div>
        </div>
        <div class="deck-actions">
          <router-link :to="'/study/' + deck._id" class="study-button">
            <i class="fa-solid fa-play"></i>
            Học ngay
          </router-link>
          <router-link :to="'/deck/' + deck._id" class="edit-button">
            <i class="fas fa-edit"></i> Chỉnh sửa
          </router-link>
        </div>
      </div>
    </div>

    <!-- Modal tạo bộ thẻ mới -->
    <div v-if="showCreateDeckModal" class="modal-overlay">
      <div class="modal">
        <h2>Tạo bộ thẻ mới</h2>
        <form @submit.prevent="createDeck">
          <div class="form-group">
            <label>Tên bộ thẻ</label>
            <input v-model="newDeck.name" type="text" required :disabled="isLoading">
          </div>
          <div class="form-group">
            <label>Mô tả</label>
            <textarea v-model="newDeck.description" rows="3" :disabled="isLoading"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateDeckModal = false" class="cancel-button" :disabled="isLoading">
              Hủy
            </button>
            <button type="submit" class="submit-button" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              <span>{{ isLoading ? 'Đang xử lý...' : 'Tạo bộ thẻ' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDeckStore } from '@/stores/deck'
const store = useDeckStore()
const showCreateDeckModal = ref(false)
const isLoading = ref(true)
const newDeck = ref({
  name: '',
  description: ''
})

const decks = computed(() => store.decks)

const fetchDecks = async () => {
  isLoading.value = true
  try {
    await store.fetchDecks()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDecks()
})

const createDeck = async () => {
  isLoading.value = true
  try {
    await store.createDeck(newDeck.value.name, newDeck.value.description)
    showCreateDeckModal.value = false
    newDeck.value = { name: '', description: '' }
    await fetchDecks()
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.deck-list {
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

.create-button {
  padding: 0.75rem 1.5rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.decks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.deck-card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
}

.deck-info h3 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.deck-info p {
  color: #666;
  margin-bottom: 1rem;
}

.deck-stats {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.875rem;
}

.deck-stats i {
  color: #6366f1;
  margin-right: 0.25rem;
}

.deck-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.study-button,
.edit-button {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.5rem;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
}

.study-button {
  background-color: #6366f1;
  color: white;
}

.edit-button {
  background-color: #f3f4f6;
  color: #374151;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button,
.submit-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #374151;
}

.submit-button {
  background-color: #6366f1;
  color: white;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.submit-button:disabled,
.cancel-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.loading-container .loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f4f6;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
  color: #666;
}

.empty-state i {
  font-size: 3rem;
  color: #6366f1;
}

.empty-state p {
  font-size: 1.1rem;
}

.create-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>