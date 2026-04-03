import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'
const THEME_STORAGE_KEY = 'rm-theme'

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = ref<ThemeMode>('light')

  const isDarkMode = computed(() => theme.value === 'dark')

  const applyTheme = (mode: ThemeMode) => {
    document.documentElement.dataset.theme = mode
  }

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme.value = savedTheme
    } else {
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    applyTheme(theme.value)
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  watch(theme, (nextTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
  })

  return {
    theme,
    isDarkMode,
    initializeTheme,
    toggleTheme,
  }
})
