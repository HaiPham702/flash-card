import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useNotificationStore } from './stores/notification'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Global error handler for API authentication errors
app.config.errorHandler = (error: any, instance, info) => {
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()

    // If there's a 401 Unauthorized error, log the user out
    if (error.message && (
        error.message.includes('401') ||
        error.message.toLowerCase().includes('unauthorized') ||
        error.message.toLowerCase().includes('token is not valid') ||
        error.message.toLowerCase().includes('token has expired')
    )) {
        console.error('Authentication error, logging out:', error)

        // Show notification
        notificationStore.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')

        // Log user out and redirect
        authStore.logout()
        router.push('/login')
    } else {
        console.error('Error:', error)
        notificationStore.error(error.message || 'Đã xảy ra lỗi')
    }
}

app.mount('#app')
