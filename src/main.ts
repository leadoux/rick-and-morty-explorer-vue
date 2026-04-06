import { createApp } from 'vue'
import { createPinia } from 'pinia'
import urql, { createClient, fetchExchange, cacheExchange } from '@urql/vue'
import { createHead } from '@vueuse/head'

import App from './App.vue'
import router from './router'
import { usePreferencesStore } from './stores/preferences'
import { createCachedGraphqlFetch } from './lib/graphqlCache'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()
const client = createClient({
  // Use local proxy in dev to avoid browser CORS restrictions.
  url: import.meta.env.DEV
    ? '/graphql'
    : (import.meta.env.VITE_GRAPHQL_URL as string | undefined) ?? 'https://rickandmortyapi.com/graphql',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-first',
  fetchOptions: {
    method: 'POST',
  },
  fetch: createCachedGraphqlFetch(),
})

app.use(pinia)
app.use(router)
app.use(urql, client)
app.use(head)

const preferencesStore = usePreferencesStore(pinia)
preferencesStore.initializeTheme()

app.mount('#app')
