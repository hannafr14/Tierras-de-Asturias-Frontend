import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCurrentUser, logoutUser } from '@/services/authApi'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const sessionError = ref('')
    const isRestoringSession = ref(false)

    const isAuthenticated = computed(() => {
        return user.value !== null
    })

    function setUser(profile) {
        user.value = profile
        sessionError.value = ''
    }

    async function restoreSession() {
        isRestoringSession.value = true

        try {
            const profile = await getCurrentUser()
            user.value = profile
            sessionError.value = ''
        } catch (error) {
            sessionError.value =
                'No se pudo comprobar tu sesión. Inténtalo de nuevo.'
            throw error
        } finally {
            isRestoringSession.value = false
        }
    }

    async function logout() {
        await logoutUser()
        user.value = null
        sessionError.value = ''
    }

    return {
        user,
        sessionError,
        isAuthenticated,
        isRestoringSession,
        setUser,
        restoreSession,
        logout,
    }
})