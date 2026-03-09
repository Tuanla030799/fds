import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeName = 'ocean' | 'rose' | 'forest' | 'grape'

const THEME_KEY = 'fds-ui-theme'
const TOKEN_KEY = 'fds-access-token'
const DEFAULT_THEME: ThemeName = 'ocean'

function isThemeName(value: string | null): value is ThemeName {
  return value === 'ocean' || value === 'rose' || value === 'forest' || value === 'grape'
}

function applyTheme(next: ThemeName) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (next === DEFAULT_THEME) root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', next)
}

export const useAppStore = defineStore('app', () => {
  const initialized = ref(false)
  const theme = ref<ThemeName>(DEFAULT_THEME)
  const accessToken = ref('')
  const requestCount = ref(0)

  const isLoading = computed(() => requestCount.value > 0)

  function hydrate() {
    if (initialized.value || typeof window === 'undefined') return
    initialized.value = true

    const storedTheme = window.localStorage.getItem(THEME_KEY)
    if (isThemeName(storedTheme)) theme.value = storedTheme

    accessToken.value = window.localStorage.getItem(TOKEN_KEY) || ''
    applyTheme(theme.value)
  }

  function setTheme(next: ThemeName) {
    theme.value = next
    applyTheme(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, next)
    }
  }

  function setAccessToken(token: string) {
    accessToken.value = token.trim()
    if (typeof window !== 'undefined') {
      if (accessToken.value) window.localStorage.setItem(TOKEN_KEY, accessToken.value)
      else window.localStorage.removeItem(TOKEN_KEY)
    }
  }

  function clearAccessToken() {
    setAccessToken('')
  }

  function startRequest() {
    requestCount.value += 1
  }

  function finishRequest() {
    requestCount.value = Math.max(0, requestCount.value - 1)
  }

  return {
    accessToken,
    clearAccessToken,
    finishRequest,
    hydrate,
    initialized,
    isLoading,
    requestCount,
    setAccessToken,
    setTheme,
    startRequest,
    theme,
  }
})
