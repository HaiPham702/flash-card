<template>
  <div class="deck-detail">
    <div class="header">
      <div class="deck-info">
        <div class="deck-title-section">
          <h1 v-if="!editingDeckInfo">{{ deck.name }}</h1>
          <input v-else v-model="editedDeckInfo.name" class="edit-deck-input" placeholder="Tên bộ thẻ" required />

          <p v-if="!editingDeckInfo">{{ deck.description }}</p>
          <textarea v-else v-model="editedDeckInfo.description" class="edit-deck-textarea"
            placeholder="Mô tả (tùy chọn)" />

          <div v-if="editingDeckInfo" class="edit-deck-actions">
            <button @click="cancelEditDeckInfo" class="cancel-button">Hủy</button>
            <button @click="saveDeckInfo" class="submit-button">Lưu</button>
          </div>
          <button v-else @click="startEditDeckInfo" class="edit-deck-info-button">
            <i class="fas fa-edit"></i> Sửa thông tin
          </button>
        </div>
      </div>
      <div class="header-actions">
        <router-link :to="deck.cards.length > 0 ? '/study/' + deckId : ''" class="study-button"
          :class="{ 'disabled': deck.cards.length === 0 }" @click.prevent="deck.cards.length === 0 ? null : null">
          <i class="fa-solid fa-play"></i>
          Học ngay
          <span v-if="deck.cards.length === 0" class="tooltip">Thêm thẻ để bắt đầu học</span>
        </router-link>
        <button @click="showAddCardModal = true" class="add-button">
          <i class="fas fa-plus"></i> Thêm thẻ mới
        </button>
        <button @click="deleteDeck" class="delete-deck-button">
          <i class="fa-solid fa-trash"></i> Xóa bộ thẻ
        </button>
      </div>
    </div>

    <div v-if="deck.cards.length > 1" class="reorder-hint">
      <i class="fas fa-info-circle"></i>
      Kéo thả để sắp xếp lại thứ tự các thẻ
    </div>

    <draggable v-model="sortableCards" class="cards-list" item-key="_id" @end="onDragEnd" v-if="deck.cards.length > 0"
      :animation="200" ghost-class="ghost-card" handle=".card-drag-handle">
      <template #item="{ element }">
        <div class="card-item">
          <div class="card-drag-handle" v-if="deck.cards.length > 1">
            <i class="fas fa-grip-lines"></i>
          </div>
          <div class="card-content">
            <div class="card-row">
              <div class="front">
                <h3>Mặt trước</h3>
                <p>{{ element.front }}</p>
              </div>
              <div class="back">
                <h3>Mặt sau</h3>
                <p>{{ element.back }}</p>
              </div>
            </div>
            <div v-if="element.image" class="card-image-container">
              <img :src="element.image" alt="Card image" class="card-image">
            </div>
          </div>
          <div class="card-actions">
            <button @click="editCard(element)" class="edit-button">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteCard(element.id)" class="delete-button">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </template>
    </draggable>

    <div v-if="deck.cards.length === 0 && !isLoading" class="empty-deck">
      <i class="fas fa-layer-group"></i>
      <p>Bộ thẻ này chưa có thẻ nào</p>
      <button @click="showAddCardModal = true" class="add-button">
        <i class="fas fa-plus"></i> Thêm thẻ đầu tiên
      </button>
    </div>

    <!-- Modal thêm/sửa thẻ -->
    <div v-if="showAddCardModal || editingCard" class="modal-overlay">
      <div class="modal">
        <h2>{{ editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới' }}</h2>
        <form @submit.prevent="saveCard">
          <div class="form-group">
            <label>Mặt trước:</label>
            <input v-model="currentCard.front" type="text" placeholder="Nhập nội dung mặt trước..." class="form-input"
              @input="fetchAISuggestions(currentCard.front)" required>
          </div>

          <div class="form-group">
            <label>Mặt sau:</label>
            <div class="back-content-container">
              <textarea v-model="currentCard.back" rows="3" placeholder="Nhập nội dung mặt sau..." class="form-textarea"
                required></textarea>

              <div v-if="isLoadingSuggestions" class="suggestions-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Đang tạo gợi ý...</span>
              </div>

              <div v-if="showSuggestions && aiSuggestions.length > 0" class="suggestions-dropdown">
                <div class="suggestions-header">
                  <span>Gợi ý từ AI:</span>
                  <button type="button" @click="showSuggestions = false" class="close-suggestions">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="suggestions-list">
                  <div v-for="(suggestion, index) in aiSuggestions" :key="index" class="suggestion-item"
                    @click="selectSuggestion(suggestion)">
                    {{ suggestion }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Hình ảnh</label>
            <div class="image-search">
              <input v-model="searchQuery" @input="searchImages" placeholder="Tìm kiếm hình ảnh..."
                class="image-search-input">

              <div v-if="selectedImage" class="selected-image">
                <img :src="selectedImage" alt="Selected image">
                <button type="button" @click="selectedImage = null" class="remove-image">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div v-if="isSearchingImages" class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Đang tìm kiếm...</span>
              </div>
              <div v-if="searchResults.length > 0" class="image-results">
                <div v-for="result in searchResults" :key="result.id" class="image-result"
                  @click="selectImage(result.urls.regular)">
                  <img :src="result.urls.thumb" :alt="result.alt_description">
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="cancelEdit" class="cancel-button">
              Hủy
            </button>
            <button type="submit" class="submit-button">
              {{ editingCard ? 'Lưu thay đổi' : 'Thêm thẻ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeckStore } from '@/stores/deck'
import axios from 'axios'
import { generateSuggestions } from '@/api/ai'
import draggable from 'vuedraggable'
import { useAuthStore } from '@/stores/auth'


interface Card {
  _id: any
  id: any
  front: string
  back: string
  image?: string
  lastReview?: Date
  nextReview?: Date
  level: number
  order?: number
}

const route = useRoute()
const router = useRouter()
const store = useDeckStore()
const authStore = useAuthStore()


const deckId = route.params.id

const showAddCardModal = ref(false)
const editingCard = ref<Card | null>(null)
const editingDeckInfo = ref(false)
const currentCard = ref({
  front: '',
  back: '',
  image: ''
})

const editedDeckInfo = ref({
  name: '',
  description: ''
})

const aiSuggestions = ref<string[]>([])
const isLoadingSuggestions = ref(false)
const showSuggestions = ref(false)
const suggestionTimeout = ref<number | null>(null)

const deck = ref<{
  id: string
  name: string
  description: string
  cards: Card[]
}>({
  id: '',
  name: '',
  description: '',
  cards: []
})

const sortableCards = computed({
  get: () => {
    return [...deck.value.cards].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 0
      const orderB = b.order !== undefined ? b.order : 0
      return orderA - orderB
    })
  },
  set: (value) => {
    // We don't need to set anything here as we'll use the drag end event\

    deck.value.cards = value.map((card, index) => ({
      ...card,
      order: index
    }))
  }
})

const UNSPLASH_API_KEY = 'AhQ1hPHwx0_s4Oo4MgZ9BD_Owjy_TIQZvyNydOIe7m0'
const VITE_UNSPLASH_LINK = 'https://api.unsplash.com/search/photos'
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedImage = ref<string | null>(null)
const isSearchingImages = ref(false)
const searchTimeout = ref<number | null>(null)
const isLoading = ref(true)

const initData = async () => {
  isLoading.value = true
  try {
    await store.fetchDecks()
    const foundDeck = store.getDeckById(deckId)
    if (foundDeck) {
      deck.value = {
        id: foundDeck._id || '',
        name: foundDeck.name || '',
        description: foundDeck.description || '',
        cards: foundDeck.cards.map(card => ({
          _id: card._id || '',
          id: card._id || '',
          front: card.front,
          back: card.back,
          image: card.image,
          lastReview: card.lastReview,
          nextReview: card.nextReview,
          level: card.level,
          order: card.order
        }))
      }
    }
  } finally {
    isLoading.value = false
  }
}

const startEditDeckInfo = () => {
  editedDeckInfo.value = {
    name: deck.value.name,
    description: deck.value.description || ''
  }
  editingDeckInfo.value = true
}

const cancelEditDeckInfo = () => {
  editingDeckInfo.value = false
}

const saveDeckInfo = async () => {
  if (!editedDeckInfo.value.name.trim()) {
    alert('Tên bộ thẻ không được để trống')
    return
  }

  var userId = authStore.currentUser?.id
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }
    await store.updateDeck(deckId, editedDeckInfo.value.name, editedDeckInfo.value.description, userId)
    await initData()
    editingDeckInfo.value = false
  } catch (error) {
    console.error('Failed to update deck info:', error)
  }
}

const editCard = (card: Card) => {
  editingCard.value = card
  currentCard.value = {
    front: card.front,
    back: card.back,
    image: card.image || ''
  }
  selectedImage.value = card.image || null
}

const cancelEdit = () => {
  showAddCardModal.value = false
  editingCard.value = null
  currentCard.value = { front: '', back: '', image: '' }
  selectedImage.value = null
  searchQuery.value = ''
  searchResults.value = []
  isSearchingImages.value = false
}

const saveCard = async () => {
  const cardData: Card = {
    _id: '',
    id: '',
    front: currentCard.value.front,
    back: currentCard.value.back,
    image: selectedImage.value || '',
    level: 1
  }


  if (editingCard.value) {
    await store.updateCard(deckId, editingCard.value.id, cardData)
  } else {
    await store.addCard(deckId, cardData)
  }
  await initData()
  cancelEdit()
}

const deleteCard = async (cardId: string) => {
  if (confirm('Bạn có chắc chắn muốn xóa thẻ này?')) {
    await store.deleteCard(deckId, cardId)
    await initData()
  }
}

const deleteDeck = async () => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ bộ thẻ này? Hành động này không thể hoàn tác.')) {
    await store.deleteDeck(deckId)
    router.push('/decks')
  }
}

// Tìm kiếm hình ảnh từ Unsplash
const searchImages = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearchingImages.value = true
  searchTimeout.value = window.setTimeout(async () => {
    try {
      const response = await axios.get(VITE_UNSPLASH_LINK, {
        params: {
          query: searchQuery.value,
          client_id: UNSPLASH_API_KEY,
          per_page: 20
        }
      })
      searchResults.value = response.data.results
    } catch (error) {
      console.error('Error searching images:', error)
    } finally {
      isSearchingImages.value = false
    }
  }, 500)
}

const selectImage = (url: string) => {
  selectedImage.value = url
  searchResults.value = []
  searchQuery.value = ''
}

// Gợi ý từ AI
const fetchAISuggestions = (query: string) => {
  if (suggestionTimeout.value) {
    clearTimeout(suggestionTimeout.value)
  }

  if (!query.trim() || query.length < 3) {
    showSuggestions.value = false
    return
  }

  suggestionTimeout.value = window.setTimeout(async () => {
    isLoadingSuggestions.value = true
    showSuggestions.value = false
    try {
      const suggestions = await generateSuggestions(query)
      if (Array.isArray(suggestions)) {
        aiSuggestions.value = suggestions
      } else if (typeof suggestions === 'string') {
        aiSuggestions.value = [suggestions]
      } else if (suggestions && typeof suggestions === 'object' && 'response' in suggestions) {
        aiSuggestions.value = [(suggestions as { response: string }).response]
      } else {
        aiSuggestions.value = []
      }
      showSuggestions.value = true
    } catch (error) {
      console.error('Error getting suggestions:', error)
    } finally {
      isLoadingSuggestions.value = false
    }
  }, 600)
}

const selectSuggestion = (suggestion: string) => {
  currentCard.value.back = suggestion
  showSuggestions.value = false
}

onMounted(() => {
  initData()
})

const onDragEnd = async () => {
  if (!sortableCards.value.length) return

  // Create an array of card IDs and new orders to update on the server
  const cardOrders = sortableCards.value.map((card, index) => {
    const cardId = card._id || card.id
    console.log('Processing card:', { id: cardId, front: card.front, index })
    return {
      id: cardId,
      order: index
    }
  })

  console.log('Reordering cards with:', cardOrders);

  // Update the orders on the server
  isLoading.value = true
  try {
    await store.reorderCards(deckId, cardOrders)
  } catch (error) {
    console.error('Error reordering cards:', error);
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.deck-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.deck-info {
  flex: 1;
  min-width: 300px;
}

.deck-title-section {
  position: relative;
}

.edit-deck-info-button {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.5rem;
  padding: 0.3rem 0.5rem;
}

.edit-deck-info-button:hover {
  background-color: #f3f4f6;
  border-radius: 0.3rem;
}

.edit-deck-input,
.edit-deck-textarea {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.edit-deck-textarea {
  min-height: 5rem;
  resize: vertical;
}

.edit-deck-actions {
  display: flex;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.add-button,
.study-button,
.delete-deck-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.add-button {
  background-color: #6366f1;
  color: white;
}

.study-button {
  background-color: #10b981;
  color: white;
  text-decoration: none;
  position: relative;
}

.study-button.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.study-button .tooltip {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #374151;
  color: white;
  padding: 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

.study-button.disabled:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.delete-deck-button {
  background-color: #ef4444;
  color: white;
}

.reorder-hint {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #6366f1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card-item {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card-drag-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #aaa;
  cursor: grab;
  padding: 5px;
}

.card-drag-handle:hover {
  color: #666;
}

.ghost-card {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #6366f1;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-row {
  display: flex;
  gap: 1.5rem;
}

.front,
.back {
  flex: 1;
}

.front h3,
.back h3 {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.front p,
.back p {
  word-break: break-word;
}

.card-image-container {
  margin-top: 1rem;
}

.card-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 0.5rem;
  display: block;
  margin: 0 auto;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.edit-button,
.delete-button {
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.edit-button {
  background-color: #f3f4f6;
  color: #374151;
}

.delete-button {
  background-color: #fee2e2;
  color: #ef4444;
}

.empty-deck {
  padding: 3rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  text-align: center;
}

.empty-deck i {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-deck p {
  margin-bottom: 1.5rem;
  color: #6b7280;
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
  z-index: 50;
}

.modal {
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.form-textarea {
  min-height: 5rem;
  resize: vertical;
}

.back-content-container {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #d1d5db;
}

.close-suggestions {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.suggestions-list {
  padding: 0.5rem 0;
}

.suggestion-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f3f4f6;
}

.suggestions-loading {
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
}

.image-search {
  position: relative;
}

.image-search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.image-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  z-index: 10;
  max-height: 250px;
  overflow-y: auto;
}

.image-result {
  cursor: pointer;
  border-radius: 0.3rem;
  overflow: hidden;
}

.image-result:hover {
  opacity: 0.8;
}

.image-result img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.selected-image {
  margin-top: 1rem;
  position: relative;
}

.selected-image img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 0.5rem;
  display: block;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.loading-spinner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
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

@media (max-width: 768px) {
  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .card-row {
    flex-direction: column;
    gap: 1rem;
  }

  .divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 1rem 0;
  }
}
</style>