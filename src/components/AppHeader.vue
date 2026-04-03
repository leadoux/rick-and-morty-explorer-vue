<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useCompareStore } from '@/stores/compare'
import { usePreferencesStore } from '@/stores/preferences'
import AppButton from './AppButton.vue'
import GlobalSearch from './GlobalSearch.vue'

const route = useRoute()
const preferencesStore = usePreferencesStore()
const compareStore = useCompareStore()
const { isDarkMode } = storeToRefs(preferencesStore)

const isCurrentPath = (path: string) => route.path === path
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink class="brand" to="/characters">Rick and Morty Explorer</RouterLink>
      <nav class="nav-links">
        <RouterLink :class="{ active: isCurrentPath('/characters') }" to="/characters">Characters</RouterLink>
        <RouterLink :class="{ active: isCurrentPath('/episodes') }" to="/episodes">Episodes</RouterLink>
        <RouterLink :class="{ active: isCurrentPath('/locations') }" to="/locations">Locations</RouterLink>
        <RouterLink :class="{ active: isCurrentPath('/favorites') }" to="/favorites">Favorites</RouterLink>
        <RouterLink :class="{ active: isCurrentPath('/compare') }" to="/compare">
          Compare
          <span class="badge">{{ compareStore.characters.length + compareStore.episodes.length }}</span>
        </RouterLink>
      </nav>
      <div class="actions">
        <GlobalSearch />
        <AppButton variant="secondary" @click="preferencesStore.toggleTheme">
          {{ isDarkMode ? 'Light' : 'Dark' }} mode
        </AppButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface-elevated);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
  padding: 0.9rem 1rem;
}

.brand {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
}

.nav-links a.active {
  color: var(--text-primary);
  text-decoration: underline;
  text-underline-offset: 0.2rem;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.3rem;
  padding: 0 0.35rem;
  margin-left: 0.3rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-soft-text);
  font-weight: 700;
  font-size: 0.8rem;
}

@media (min-width: 1024px) {
  .header-inner {
    grid-template-columns: auto 1fr auto;
    align-items: center;
  }

  .actions {
    justify-content: flex-end;
  }
}
</style>
