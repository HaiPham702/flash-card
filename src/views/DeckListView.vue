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

    <div v-else class="reorder-hint" v-if="!isLoading && decks.length > 1">
      <i class="fas fa-info-circle"></i>
      Kéo thả để sắp xếp lại bộ thẻ trong từng nhóm tháng
    </div>

    <div v-if="!isLoading && decks.length > 0" class="month-groups">
      <div v-for="(group, monthKey) in decksByMonth" :key="monthKey" class="month-group">
        <h2 class="month-title">{{ formatMonthTitle(String(monthKey)) }}</h2>
        
        <draggable v-model="group.decks" class="decks-grid" item-key="_id" @end="(event) => onDragEnd(event, String(monthKey))"
          :animation="200" ghost-class="ghost-deck" handle=".deck-drag-handle" :group="{ name: String(monthKey) }">
          <template #item="{ element, index }">
            <div class="deck-card">
              <div class="deck-drag-handle">
                <i class="fas fa-grip-lines"></i>
              </div>
              <div class="deck-info">
                <h3>{{ element.name }}</h3>
                <p>{{ element.description }}</p>
                <div class="deck-stats">
                  <span><i class="fa-solid fa-cards-blank"></i> {{ element.cards.length }} thẻ</span>
                  <span><i class="fas fa-clock"></i> {{ element.dueCards }} thẻ cần ôn tập</span>
                </div>
                <div class="deck-meta">
                  <span><i class="fas fa-user"></i> Tạo bởi: {{ element.creator?.name }}</span>
                  <span><i class="fas fa-clock"></i> Tạo: {{ new Date(element.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
              <div class="deck-actions">
                <router-link :to="'/study/' + element._id" class="study-button">
                  <i class="fa-solid fa-play"></i>
                  Học ngay
                </router-link>
                <router-link :to="'/deck/' + element._id" class="edit-button">
                  <i class="fas fa-edit"></i> Chỉnh sửa
                </router-link>
              </div>
            </div>
          </template>
        </draggable>
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
import draggable from 'vuedraggable'

const store = useDeckStore()
const showCreateDeckModal = ref(false)
const isLoading = ref(true)
const newDeck = ref({
  name: '',
  description: ''
})

const decks = computed(() => store.decks)

// Compute deck groups by month
const decksByMonth = computed(() => {
  const groupedDecks: Record<string, { decks: any[] }> = {};
  
  decks.value.forEach(deck => {
    const createDate = new Date(deck.createdAt);
    const monthKey = `${createDate.getFullYear()}-${createDate.getMonth() + 1}`;
    
    if (!groupedDecks[monthKey]) {
      groupedDecks[monthKey] = { decks: [] };
    }
    
    groupedDecks[monthKey].decks.push(deck);
  });
  
  // Sort decks within each group by order
  Object.keys(groupedDecks).forEach(monthKey => {
    groupedDecks[monthKey].decks.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 0;
      const orderB = b.order !== undefined ? b.order : 0;
      return orderA - orderB;
    });
  });
  
  // Sort month groups from newest to oldest
  return Object.fromEntries(
    Object.entries(groupedDecks).sort((a, b) => b[0].localeCompare(a[0]))
  );
});

// Format month titles for display
const formatMonthTitle = (monthKey: string) => {
  const parts = monthKey.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const date = new Date(year, month);
  
  // Vietnamese month names
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

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

const onDragEnd = async (event: any, monthKey: string) => {
  const monthGroup = decksByMonth.value[monthKey];
  if (!monthGroup || !monthGroup.decks.length) return;

  // Create an array of deck IDs and new orders to update on the server
  // We only update the order within the same month group
  const deckOrders = monthGroup.decks.map((deck, index) => {
    const deckId = deck._id || deck.id;
    console.log('Processing deck:', { id: deckId, name: deck.name, index, monthGroup: monthKey });
    return {
      id: deckId,
      order: index
    };
  });

  console.log('Reordering decks with:', deckOrders);

  // Update the orders on the server
  isLoading.value = true;
  try {
    await store.reorderDecks(deckOrders);
  } catch (error) {
    console.error('Error reordering decks:', error);
  } finally {
    isLoading.value = false;
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
  position: relative;
}

.deck-drag-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #aaa;
  cursor: grab;
  padding: 5px;
}

.deck-drag-handle:hover {
  color: #666;
}

.ghost-deck {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #6366f1;
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

.reorder-hint {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #6366f1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f4f6;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.empty-state i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: #6b7280;
}

.deck-meta {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.deck-meta i {
  color: #6366f1;
  margin-right: 0.25rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Month group styles */
.month-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.month-group {
  background-color: #f9fafb;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.month-title {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
  font-size: 1.25rem;
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
  position: relative;
}

.deck-drag-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #aaa;
  cursor: grab;
  padding: 5px;
}

.deck-drag-handle:hover {
  color: #666;
}

.ghost-deck {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #6366f1;
}
</style>