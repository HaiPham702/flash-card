<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
    try {
        await authStore.login(email.value, password.value)
        router.push('/')
    } catch (err) {
        error.value = 'Email hoặc mật khẩu không chính xác'
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
                    <input type="email" id="email" v-model="email" required placeholder="Nhập email của bạn" />
                </div>
                <div class="form-group">
                    <label for="password">Mật khẩu</label>
                    <input type="password" id="password" v-model="password" required
                        placeholder="Nhập mật khẩu của bạn" />
                </div>
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
                <button type="submit" class="login-button">
                    Đăng nhập
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
}

.login-button:hover {
    background-color: #4f46e5;
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
</style>