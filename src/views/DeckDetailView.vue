<template>
  <div class="deck-detail">
    <div class="header">
      <div class="deck-info">
        <h1>{{ deck.name }}</h1>
        <p>{{ deck.description }}</p>
      </div>
      <div class="header-actions">
        <router-link :to="deck.cards.length > 0 ? '/study/' + deckId : ''" class="study-button"
          :class="{ 'disabled': deck.cards.length === 0 }" @click.prevent="deck.cards.length === 0 ? null : null">
          <i class="fas fa-play"></i> Học ngay
          <span v-if="deck.cards.length === 0" class="tooltip">Thêm thẻ để bắt đầu học</span>
        </router-link>
        <button @click="showAddCardModal = true" class="add-button">
          <i class="fas fa-plus"></i> Thêm thẻ mới
        </button>
        <button @click="deleteDeck" class="delete-deck-button">
          <i class="fas fa-trash"></i> Xóa bộ thẻ
        </button>
      </div>
    </div>

    <div class="cards-list">
      <div v-for="card in deck.cards" :key="card.id" class="card-item">
        <div class="card-content">
          <div class="front">
            <h3>Mặt trước</h3>
            <p>{{ card.front }}</p>
            <img v-if="card.image" :src="card.image" alt="Card image" class="card-image">
          </div>
          <div class="divider"></div>
          <div class="back">
            <h3>Mặt sau</h3>
            <p>{{ card.back }}</p>
          </div>
        </div>
        <div class="card-actions">
          <button @click="editCard(card)" class="edit-button">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="deleteCard(card.id)" class="delete-button">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal thêm/sửa thẻ -->
    <div v-if="showAddCardModal || editingCard" class="modal-overlay">
      <div class="modal">
        <h2>{{ editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới' }}</h2>
        <form @submit.prevent="saveCard">
          <div class="form-group">
            <label>Mặt trước:</label>
            <input v-model="currentCard.front" type="text" placeholder="Nhập nội dung mặt trước..." class="form-input"
              required>
          </div>

          <div class="form-group">
            <label>Mặt sau:</label>
            <textarea v-model="currentCard.back" rows="3" placeholder="Nhập nội dung mặt sau..." class="form-textarea"
              required></textarea>
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

interface Card {
  _id: any
  id: any
  front: string
  back: string
  image?: string
  lastReview?: Date
  nextReview?: Date
  level: number
}

const route = useRoute()
const router = useRouter()
const store = useDeckStore()
const deckId = route.params.id

const showAddCardModal = ref(false)
const editingCard = ref<Card | null>(null)
const currentCard = ref({
  front: '',
  back: '',
  image: ''
})

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

const UNSPLASH_API_KEY = 'AhQ1hPHwx0_s4Oo4MgZ9BD_Owjy_TIQZvyNydOIe7m0'
const VITE_UNSPLASH_LINK = 'https://api.unsplash.com/search/photos'
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedImage = ref<string | null>(null)
const isSearchingImages = ref(false)
const searchTimeout = ref<number | null>(null)

const initData = async () => {
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
        level: card.level
      }))
    }
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
    image: selectedImage.value || undefined,
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
  if (confirm('Bạn có chắc chắn muốn xóa bộ thẻ này? Tất cả các thẻ trong bộ sẽ bị xóa.')) {
    await store.deleteDeck(deckId)
    router.push('/decks')
  }
}

const searchImages = async (event?: Event) => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }

  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  isSearchingImages.value = true

  searchTimeout.value = window.setTimeout(async () => {
    try {
      const params = {
        client_id: UNSPLASH_API_KEY,
        query: encodeURIComponent(searchQuery.value),
        per_page: 10,
        page: 1
      }
      const response = await axios.get(VITE_UNSPLASH_LINK, { params })
      searchResults.value = response.data.results
    } catch (error) {
      console.error('Error searching images:', error)
    } finally {
      isSearchingImages.value = false
    }
  }, 700)
}

const selectImage = (imageUrl: string) => {
  selectedImage.value = imageUrl
  isSearchingImages.value = false
}

initData()
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
}

.deck-info h1 {
  margin-bottom: 0.5rem;
}

.deck-info p {
  color: #666;
}

.add-button {
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

.cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.card-item {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: 1rem;
}

.card-content {
  display: flex;
  gap: 1rem;
}

.front,
.back {
  flex: 1;
}

.front h3,
.back h3 {
  font-size: 0.875rem;
  text-transform: uppercase;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.divider {
  width: 1px;
  background-color: #e5e7eb;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.edit-button,
.delete-button {
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.edit-button {
  background-color: #f3f4f6;
  color: #374151;
}

.delete-button {
  background-color: #fee2e2;
  color: #dc2626;
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
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
}

.modal {
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  margin: 2rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 80px;
  max-height: 150px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
  color: #6366f1;
}

.loading-spinner i {
  font-size: 1.25rem;
}

.loading-spinner span {
  font-size: 0.875rem;
}

.image-results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.image-result {
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
}

.image-result img {
  width: 100%;
  height: 80px;
  object-fit: cover;
}

.image-result:hover {
  opacity: 0.8;
}

.card-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

.image-search {
  margin-top: 0.5rem;
}

.image-search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.selected-image {
  position: relative;
  margin-top: 1rem;
}

.selected-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.delete-deck-button {
  padding: 0.75rem 1.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.delete-deck-button:hover {
  background-color: #dc2626;
}

.study-button {
  padding: 0.75rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  text-decoration: none;
}

.study-button:hover {
  background-color: #059669;
}

.study-button.disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  position: relative;
}

.study-button.disabled:hover {
  background-color: #9ca3af;
}

.study-button .tooltip {
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #374151;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.study-button.disabled:hover .tooltip {
  opacity: 1;
}

.question-type-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
}

.true-false-options {
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
}

.true-false-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.option-item input[type="text"] {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.matching-pair {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.matching-pair input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

.add-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.remove-option {
  padding: 0.5rem;
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

/* Media queries */
@media screen and (max-height: 600px) {
  .modal {
    padding: 1rem;
    margin: 1rem 0;
  }

  .form-textarea {
    min-height: 60px;
    max-height: 100px;
  }

  .image-results {
    max-height: 150px;
  }

  .image-result img {
    height: 60px;
  }

  .selected-image img {
    height: 100px;
  }

  .card-image {
    height: 100px;
  }
}

@media screen and (max-height: 400px) {
  .modal {
    padding: 0.75rem;
    margin: 0.5rem 0;
  }

  .form-group {
    margin-bottom: 0.5rem;
  }

  .form-textarea {
    min-height: 40px;
    max-height: 80px;
  }

  .image-results {
    max-height: 100px;
  }

  .image-result img {
    height: 50px;
  }

  .selected-image img {
    height: 80px;
  }
}
</style>