import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'

interface User {
    _id: string
    id: string
    email: string
    name: string
}

export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref<User | null>(null)
    const token = ref<string | null>(null)

    const isAuthenticated = computed(() => !!token.value)

    const login = async (email: string, password: string) => {
        try {
            const data = await authApi.login(email, password)
            token.value = data.token
            currentUser.value = data.user

            // Store token in localStorage
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const logout = () => {
        token.value = null
        currentUser.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    const initializeAuth = () => {
        const storedToken = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (storedToken && userStr) {
            token.value = storedToken
            currentUser.value = JSON.parse(userStr)
        }
    }

    const register = async (name: string, email: string, password: string) => {
        try {
            const data = await authApi.register(name, email, password)
            token.value = data.token
            currentUser.value = data.user

            // Store token in localStorage
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        } catch (error) {
            console.error('Registration error:', error)
            throw error
        }
    }

    return {
        currentUser,
        isAuthenticated,
        login,
        logout,
        initializeAuth,
        register
    }
}) 