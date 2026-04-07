<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const mainContentRef = ref<HTMLElement | null>(null)
const routeAnnouncement = ref('')
let hasNavigated = false

const pageTitle = computed(() => (route.meta.title as string) ?? 'Rick and Morty Explorer')

useHead(
  computed(() => ({
    title: pageTitle.value,
  })),
)

watch(
  () => route.fullPath,
  async () => {
    // Keep initial load behavior intact; move focus on in-app navigation only.
    if (!hasNavigated) {
      hasNavigated = true
      return
    }

    await nextTick()

    routeAnnouncement.value = pageTitle.value

    const heading = mainContentRef.value?.querySelector('h1')
    if (heading instanceof HTMLElement) {
      heading.setAttribute('tabindex', '-1')
      heading.focus()
      return
    }

    mainContentRef.value?.focus()
  },
)
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ routeAnnouncement }}
    </p>
    <AppHeader />
    <main id="main-content" ref="mainContentRef" class="main-content" tabindex="-1">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: 0;
  left: 1rem;
  z-index: 100;
  background: var(--surface-elevated);
  color: var(--text-primary);
  border: 2px solid var(--accent);
  border-radius: 0 0 0.5rem 0.5rem;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  transform: translateY(-120%);
}

.skip-link:focus-visible {
  transform: translateY(0);
}

.app-shell {
  min-height: 100vh;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.main-content:focus {
  outline: none;
}
</style>
