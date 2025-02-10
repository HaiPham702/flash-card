// src/stores/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import apolloClient from '@/graphql/client.js';
import { GET_CARDS } from '@/graphql/queries/card.js';

export const useCardStore = defineStore('card', () => {
    const cards = ref([]);
    const loading = ref(false);
    const error = ref(null);

    async function fetchCards() {
        loading.value = true;
        try {
            const { data } = await apolloClient.query({
                query: GET_CARDS,
            });
            cards.value = data.cards;
        } catch (err) {
            error.value = err;
        } finally {
            loading.value = false;
        }
    }



    return { cards, loading, error, fetchCards };
});
