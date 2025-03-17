import type { Card, Deck } from '@/stores/deck'

const API_URL = 'https://flash-card-backend-w9oj.onrender.com/api'

export async function getAllDecks(): Promise<Deck[]> {
    const response = await fetch(`${API_URL}/decks`)
    if (!response.ok) {
        throw new Error('Failed to fetch decks')
    }
    return response.json()
}

export async function getDeck(id: number): Promise<Deck> {
    const response = await fetch(`${API_URL}/decks/${id}`)
    if (!response.ok) {
        throw new Error('Failed to fetch deck')
    }
    return response.json()
}

export async function createDeck(name: string, description: string): Promise<Deck> {
    const response = await fetch(`${API_URL}/decks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
    })
    if (!response.ok) {
        throw new Error('Failed to create deck')
    }
    return response.json()
}

export async function updateDeck(id: number, name: string, description: string): Promise<Deck> {
    const response = await fetch(`${API_URL}/decks/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
    })
    if (!response.ok) {
        throw new Error('Failed to update deck')
    }
    return response.json()
}

export async function deleteDeck(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/decks/${id}`, {
        method: 'DELETE'
    })
    if (!response.ok) {
        throw new Error('Failed to delete deck')
    }
}

export async function addCard(deckId: any, card: Card): Promise<Deck> {
    const response = await fetch(`${API_URL}/decks/${deckId}/cards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(card)
    })
    if (!response.ok) {
        throw new Error('Failed to add card')
    }
    return response.json()
}

export async function updateCard(
    deckId: number,
    cardId: number,
    updates: Partial<Card>
): Promise<Deck> {
    const response = await fetch(`${API_URL}/decks/${deckId}/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    })
    if (!response.ok) {
        throw new Error('Failed to update card')
    }
    return response.json()
}

export async function deleteCard(deckId: number, cardId: number): Promise<Deck> {
    const response = await fetch(`${API_URL}/decks/${deckId}/cards/${cardId}`, {
        method: 'DELETE'
    })
    if (!response.ok) {
        throw new Error('Failed to delete card')
    }
    return response.json()
} 