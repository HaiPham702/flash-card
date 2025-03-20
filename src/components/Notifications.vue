<script setup lang="ts">
import { useNotificationStore } from '../stores/notification';

const notificationStore = useNotificationStore();
</script>

<template>
    <div class="notifications-container">
        <transition-group name="notification">
            <div v-for="notification in notificationStore.notifications" :key="notification.id"
                :class="['notification', `notification-${notification.type}`]"
                @click="notificationStore.remove(notification.id)">
                <div class="notification-message">{{ notification.message }}</div>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 350px;
}

.notification {
    padding: 12px 16px;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    display: flex;
    align-items: center;
    font-weight: 500;
}

.notification-success {
    background-color: #10b981;
    color: white;
}

.notification-error {
    background-color: #ef4444;
    color: white;
}

.notification-info {
    background-color: #3b82f6;
    color: white;
}

.notification-warning {
    background-color: #f97316;
    color: white;
}

.notification-message {
    margin-left: 10px;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>