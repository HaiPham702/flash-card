import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '@/api/deck'
import axios from 'axios'
import type { AxiosError } from 'axios'

export interface Card {
    _id: any
    id: any
    front: string
    back: string
    image?: string
    lastReview?: Date
    nextReview?: Date
    level: number
}

export interface Deck {
    _id: any
    id: any
    name: string
    description: string
    cards: Card[]
}

export const useDeckStore = defineStore('deck', () => {
    const decks = ref<Deck[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const API_URL = 'http://localhost:4000/api' // Thay đổi URL API của bạn

    // Getters
    const getDeckById = computed(() => {
        return (id: any) => decks.value.find(d => d.id === id || d._id === id)
    })

    const getDueCards = computed(() => {
        return (deckId: any) => {
            const deck = getDeckById.value(deckId)
            if (!deck) return []

            const now = new Date()
            return deck.cards.filter(card => {
                if (!card.nextReview) return true
                return card.nextReview <= now
            })
        }
    })

    // Actions
    const fetchDecks = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await axios.get(`${API_URL}/decks`)
            decks.value = response.data
        } catch (err) {
            const error = err as AxiosError
            error.value = error.message || 'Failed to fetch decks'
            console.error('Error fetching decks:', error)
        } finally {
            isLoading.value = false
        }
    }

    async function createDeck(name: string, description: string) {
        isLoading.value = true
        error.value = null
        try {
            const newDeck = await api.createDeck(name, description)
            decks.value.push(newDeck)
            return newDeck
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to create deck'
            console.error('Error creating deck:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function updateDeck(deckId: any, name: string, description: string) {
        isLoading.value = true
        error.value = null
        try {
            const updatedDeck = await api.updateDeck(deckId, name, description)
            const index = decks.value.findIndex(d => d.id === deckId)
            if (index !== -1) {
                decks.value[index] = updatedDeck
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update deck'
            console.error('Error updating deck:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function deleteDeck(deckId: any) {
        isLoading.value = true
        error.value = null
        try {
            await api.deleteDeck(deckId)
            decks.value = decks.value.filter(d => d.id !== deckId)
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete deck'
            console.error('Error deleting deck:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function addCard(deckId: any, card: Card) {
        isLoading.value = true
        error.value = null
        try {
            const updatedDeck = await api.addCard(deckId, card)
            const index = decks.value.findIndex(d => d.id === deckId)
            if (index !== -1) {
                decks.value[index] = updatedDeck
            }
            return updatedDeck
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to add card'
            console.error('Error adding card:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function updateCard(deckId: any, cardId: any, updates: Partial<Card>) {
        isLoading.value = true
        error.value = null
        try {
            const updatedDeck = await api.updateCard(deckId, cardId, updates)
            const index = decks.value.findIndex(d => d.id === deckId)
            if (index !== -1) {
                decks.value[index] = updatedDeck
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to update card'
            console.error('Error updating card:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function deleteCard(deckId: any, cardId: any) {
        isLoading.value = true
        error.value = null
        try {
            const updatedDeck = await api.deleteCard(deckId, cardId)
            const index = decks.value.findIndex(d => d.id === deckId)
            if (index !== -1) {
                decks.value[index] = updatedDeck
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to delete card'
            console.error('Error deleting card:', err)
        } finally {
            isLoading.value = false
        }
    }

    // Cập nhật thông tin review của card
    const updateCardReview = async (deckId: any, cardId: any, updates: { level: number, nextReview: Date }) => {
        isLoading.value = true
        error.value = null
        try {
            await axios.patch(`${API_URL}/decks/${deckId}/cards/${cardId}`, updates)
            // Cập nhật state local
            const deck = decks.value.find(d => d.id === deckId)
            if (deck) {
                const card = deck.cards.find(c => c.id === cardId)
                if (card) {
                    card.level = updates.level
                    card.nextReview = updates.nextReview
                    card.lastReview = new Date()
                }
            }
        } catch (err) {
            const error = err as AxiosError
            error.value = error.message || 'Failed to update card review'
            console.error('Error updating card review:', error)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchDeckById(id: any) {
        isLoading.value = true
        error.value = null
        try {
            const response = await axios.get<Deck>(`${API_URL}/decks/${id}`)
            // Thêm deck vào state nếu chưa có
            const existingDeckIndex = decks.value.findIndex(d => d.id === id)
            if (existingDeckIndex === -1) {
                decks.value.push(response.data)
            } else {
                decks.value[existingDeckIndex] = response.data
            }
            return response.data
        } catch (err) {
            console.error('Error fetching deck:', err)
            error.value = err instanceof Error ? err.message : 'Failed to fetch deck'
            return null
        } finally {
            isLoading.value = false
        }
    }

    // Initialize store
    fetchDecks()

    return {
        decks,
        isLoading,
        error,
        getDeckById,
        getDueCards,
        fetchDecks,
        createDeck,
        updateDeck,
        deleteDeck,
        addCard,
        updateCard,
        deleteCard,
        updateCardReview,
        fetchDeckById
    }
}) 