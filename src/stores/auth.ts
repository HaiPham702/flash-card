import { defineStore } from 'pinia'
import { authApi } from '../api'

interface User {
    id: string
    email: string
    name: string
}

interface AuthState {
    user: User | null
    token: string | null
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        currentUser: (state) => state.user
    },

    actions: {
        async login(email: string, password: string) {
            try {
                const data = await authApi.login(email, password)
                this.token = data.token
                this.user = data.user

                // Store token in localStorage
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
            } catch (error) {
                throw error
            }
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },

        // Initialize auth state from localStorage
        initializeAuth() {
            const token = localStorage.getItem('token')
            const userStr = localStorage.getItem('user')

            if (token && userStr) {
                this.token = token
                this.user = JSON.parse(userStr)
            }
        },

        // Register a new user
        async register(name: string, email: string, password: string) {
            try {
                const data = await authApi.register(name, email, password)
                this.token = data.token
                this.user = data.user

                // Store token in localStorage
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
            } catch (error) {
                throw error
            }
        }
    }
}) 