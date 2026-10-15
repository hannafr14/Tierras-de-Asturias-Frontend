import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCurrentUser } from '@/services/authApi'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)

    const isAuthenticated = computed(() => {
        return user.value !== null
    })

    function setUser(profile) {
        user.value = profile
    }

    async function restoreSession() {
        const profile = await getCurrentUser()
        user.value = profile
    }

    return {
        user,
        isAuthenticated,
        setUser,
        restoreSession,
    }
})