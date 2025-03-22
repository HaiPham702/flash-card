<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

// Clear error message when user starts typing
watch([email, password], () => {
    if (error.value) {
        error.value = ''
    }
})

const handleLogin = async () => {
    error.value = ''
    try {
        isLoading.value = true
        await authStore.login(email.value, password.value)
        notificationStore.success('Đăng nhập thành công')
        router.push('/')
    } catch (err) {
        error.value = 'Email hoặc mật khẩu không chính xác'
        notificationStore.error('Email hoặc mật khẩu không chính xác')
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="login-container">
        <div class="login-box">
            <h1>Đăng nhập</h1>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="email" required placeholder="Nhập email của bạn"
                        :disabled="isLoading" />
                </div>
                <div class="form-group">
                    <label for="password">Mật khẩu</label>
                    <input type="password" id="password" v-model="password" required placeholder="Nhập mật khẩu của bạn"
                        :disabled="isLoading" />
                </div>
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
                <button type="submit" class="login-button" :disabled="isLoading">
                    <span v-if="isLoading" class="loader"></span>
                    <span v-else>Đăng nhập</span>
                </button>
                <div class="register-link">
                    Chưa có tài khoản? <router-link to="/register">Đăng ký</router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 64px);
    padding: 2rem;
}

.login-box {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    width: 100%;
    max-width: 400px;
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--text-color);
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-color);
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    font-size: 1rem;
}

input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

input:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
}

.error-message {
    color: #ef4444;
    margin-bottom: 1rem;
    text-align: center;
}

.login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-button:hover {
    background-color: #4f46e5;
}

.login-button:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
}

.register-link {
    margin-top: 1rem;
    text-align: center;
}

.register-link a {
    color: var(--primary-color);
    text-decoration: none;
}

.register-link a:hover {
    text-decoration: underline;
}

.loader {
    width: 20px;
    height: 20px;
    border: 2px solid #ffffff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>