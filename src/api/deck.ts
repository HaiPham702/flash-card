import type { Card, Deck } from '@/stores/deck'
import { apiRequest } from './index'
import axios from 'axios'

const API_URL = import.meta.env.MODE == "development" ? 'http://localhost:4000/api' : 'https://flash-card-backend-x0dz.onrender.com/api'

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? {
        'Content-Type': 'application/json',
        'x-auth-token': token
    } : {
        'Content-Type': 'application/json'
    }
}

export async function getAllDecks(): Promise<Deck[]> {
    return apiRequest('/decks')
}

export async function getDeck(id: number): Promise<Deck> {
    return apiRequest(`/decks/${id}`)
}

export async function createDeck(name: string, description: string): Promise<Deck> {
    return apiRequest('/decks', 'POST', { name, description })
}

export async function updateDeck(id: number, name: string, description: string, creator: string): Promise<Deck> {
    return apiRequest(`/decks/${id}`, 'PATCH', { name, description, creator })
}

export async function deleteDeck(id: number): Promise<void> {
    return apiRequest(`/decks/${id}`, 'DELETE')
}

export async function addCard(deckId: any, card: Card): Promise<Deck> {
    return apiRequest(`/decks/${deckId}/cards`, 'POST', card)
}

export async function updateCard(
    deckId: number,
    cardId: number,
    updates: Partial<Card>
): Promise<Deck> {
    return apiRequest(`/decks/${deckId}/cards/${cardId}`, 'PATCH', updates)
}

export async function deleteCard(deckId: number, cardId: number): Promise<Deck> {
    return apiRequest(`/decks/${deckId}/cards/${cardId}`, 'DELETE')
}

export async function reorderCards(deckId: string, cardOrders: { id: string, order: number }[]) {
    try {
        console.log('API: Sending reorder cards request:', { deckId, cardOrders });
        const response = await axios.post(`${API_URL}/decks/${deckId}/reorder-cards`, cardOrders, {
            headers: getAuthHeaders()
        });
        console.log('API: Received response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API: Error reordering cards:', error);
        throw error;
    }
}

export async function reorderDecks(deckOrders: { id: string, order: number }[]) {
    try {
        console.log('API: Sending reorder decks request:', deckOrders);
        const response = await axios.post(`${API_URL}/decks/reorder`, deckOrders, {
            headers: getAuthHeaders()
        });
        console.log('API: Received response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API: Error reordering decks:', error);
        throw error;
    }
} 