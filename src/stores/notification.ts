import { defineStore } from 'pinia'

interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    timeout: number;
}

let nextId = 0;

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [] as Notification[]
    }),

    actions: {
        add(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', timeout = 3000) {
            const id = nextId++;
            const notification = { id, message, type, timeout };

            this.notifications.push(notification);

            if (timeout > 0) {
                setTimeout(() => {
                    this.remove(id);
                }, timeout);
            }

            return id;
        },

        remove(id: number) {
            const index = this.notifications.findIndex(n => n.id === id);
            if (index !== -1) {
                this.notifications.splice(index, 1);
            }
        },

        success(message: string, timeout = 3000) {
            return this.add(message, 'success', timeout);
        },

        error(message: string, timeout = 5000) {
            return this.add(message, 'error', timeout);
        },

        info(message: string, timeout = 3000) {
            return this.add(message, 'info', timeout);
        },

        warning(message: string, timeout = 4000) {
            return this.add(message, 'warning', timeout);
        }
    }
}); 