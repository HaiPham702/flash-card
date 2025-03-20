const API_URL = import.meta.env.MODE == "development" ? 'http://localhost:4000/api' : 'https://flash-card-backend-w9oj.onrender.com/api';
import router from '../router';

interface RequestOptions extends RequestInit {
    token?: string | null;
    body?: any;
}

export async function apiRequest(
    endpoint: string,
    method: string = 'GET',
    data: any = null,
    customHeaders: Record<string, string> = {}
) {
    const token = localStorage.getItem('token');
    const options: RequestOptions = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...customHeaders
        }
    };

    // Add auth token if it exists
    if (token) {
        console.log('Adding token to request:', token);
        options.headers = {
            ...options.headers,
            'x-auth-token': token
        };
    }

    // Add request body if data exists
    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    // Handle 401 unauthorized errors immediately
    if (response.status === 401) {
        // Clear auth data directly from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login
        router.push('/login');
        throw new Error('Unauthorized: Please log in again');
    }

    // Handle non-JSON responses
    if (!response.headers.get('content-type')?.includes('application/json')) {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return null;
    }

    const responseData = await response.json();

    // Handle API errors
    if (!response.ok) {
        throw new Error(responseData.message || 'API error');
    }

    return responseData;
}

// Auth API endpoints
export const authApi = {
    login: (email: string, password: string) =>
        apiRequest('/auth/login', 'POST', { email, password }),

    register: (name: string, email: string, password: string) =>
        apiRequest('/auth/register', 'POST', { name, email, password })
};

// Decks API endpoints
export const decksApi = {
    getAllDecks: () => apiRequest('/decks'),

    getDeck: (id: string) => apiRequest(`/decks/${id}`),

    createDeck: (data: any) => apiRequest('/decks', 'POST', data),

    updateDeck: (id: string, data: any) => apiRequest(`/decks/${id}`, 'PUT', data),

    deleteDeck: (id: string) => apiRequest(`/decks/${id}`, 'DELETE')
}; 