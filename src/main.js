import './style.css'
import App from './App.vue'
import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
// import VueRouter from 'vue-router'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

const vuetify = createVuetify({
    components,
    directives
})

// HTTP connection to the API
const httpLink = createHttpLink({
    // You should use an absolute URL here
    uri: import.meta.env.HTTP_LINK,
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
})


const app = createApp({
    setup() {
        provide(DefaultApolloClient, apolloClient)
    },

    render: () => h(App),
})

app.use(vuetify)


// app.use(VueRouter)

const pinia = createPinia()
app.use(pinia)

app.mount('#app')