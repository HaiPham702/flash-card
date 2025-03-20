<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

const handleRegister = async () => {
    try {
        if (password.value !== confirmPassword.value) {
            error.value = 'Mật khẩu không khớp'
            return
        }

        await authStore.register(name.value, email.value, password.value)
        router.push('/')
    } catch (err) {
        error.value = 'Đăng ký không thành công. Vui lòng thử lại.'
    }
}
</script>

<template>
    <div class="register-container">
        <div class="register-box">
            <h1>Đăng ký</h1>
            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label for="name">Họ tên</label>
                    <input type="text" id="name" v-model="name" required placeholder="Nhập họ tên của bạn" />
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="email" required placeholder="Nhập email của bạn" />
                </div>
                <div class="form-group">
                    <label for="password">Mật khẩu</label>
                    <input type="password" id="password" v-model="password" required
                        placeholder="Nhập mật khẩu của bạn" />
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Xác nhận mật khẩu</label>
                    <input type="password" id="confirmPassword" v-model="confirmPassword" required
                        placeholder="Nhập lại mật khẩu của bạn" />
                </div>
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
                <button type="submit" class="register-button">
                    Đăng ký
                </button>
                <div class="login-link">
                    Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 64px);
    padding: 2rem;
}

.register-box {
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

.register-button {
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

.register-button:hover {
    background-color: #4f46e5;
}

.login-link {
    margin-top: 1rem;
    text-align: center;
}

.login-link a {
    color: var(--primary-color);
    text-decoration: none;
}

.login-link a:hover {
    text-decoration: underline;
}
</style>