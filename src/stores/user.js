// src/stores/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import apolloClient from '@/graphql/client.js';
import { GET_USER, UPDATE_USER, GET_USERS } from '@/graphql/queries/user.js';

export const useUserStore = defineStore('user', () => {
    const user = ref(null);
    const loading = ref(false);
    const error = ref(null);

    async function fetchUser(id) {
        loading.value = true;
        try {
            const { data } = await apolloClient.query({
                query: GET_USER,
                variables: { id },
            });
            user.value = data.user;
        } catch (err) {
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    async function fetchUsers() {
        loading.value = true;
        try {
            const { data } = await apolloClient.query({
                query: GET_USERS,
            });
            user.value = data.user;
        } catch (err) {
            error.value = err;
        } finally {
            loading.value = false;
        }
    }

    async function updateUser(id, name, email) {
        try {
            const { data } = await apolloClient.mutate({
                mutation: UPDATE_USER,
                variables: { id, name, email },
            });
            user.value = data.updateUser;
        } catch (err) {
            error.value = err;
        }
    }

    return { user, loading, error, fetchUser, updateUser, fetchUsers };
});
