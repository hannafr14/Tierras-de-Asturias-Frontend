import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'
import './scss/styles.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore(pinia)

async function startApp() {
    try {
        await authStore.restoreSession()
    } catch (error) {
        console.error('Session restoration failed:', error)
    }

    app.use(router)
    await router.isReady()

    app.mount('#app')
}

startApp()
