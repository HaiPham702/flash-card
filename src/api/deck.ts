import type { Card, Deck } from '@/stores/deck'
import { apiRequest } from './index'

export async function getAllDecks(): Promise<Deck[]> {
    return apiRequest('/decks')
}

export async function getDeck(id: number): Promise<Deck> {
    return apiRequest(`/decks/${id}`)
}

export async function createDeck(name: string, description: string): Promise<Deck> {
    return apiRequest('/decks', 'POST', { name, description })
}

export async function updateDeck(id: number, name: string, description: string): Promise<Deck> {
    return apiRequest(`/decks/${id}`, 'PATCH', { name, description })
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