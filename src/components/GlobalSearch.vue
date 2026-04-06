<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@urql/vue'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { GLOBAL_SEARCH_QUERY } from '@/lib/queries'
import { isNoResultsError } from '@/lib/errors'

const searchValue = ref('')
const debouncedSearchValue = useDebouncedValue(searchValue, 350)
const shouldRun = computed(() => debouncedSearchValue.value.trim().length >= 2)

const { data, fetching, error } = useQuery({
  query: GLOBAL_SEARCH_QUERY,
  variables: computed(() => ({
    name: debouncedSearchValue.value.trim(),
  })),
  pause: computed(() => !shouldRun.value),
})

const characters = computed(() => (data.value?.characters?.results ?? []).slice(0, 5))
const episodes = computed(() => (data.value?.episodes?.results ?? []).slice(0, 5))
const locations = computed(() => (data.value?.locations?.results ?? []).slice(0, 5))

const hasResults = computed(() => {
  return characters.value.length > 0 || episodes.value.length > 0 || locations.value.length > 0
})

const hasNoResultsError = computed(() => isNoResultsError(error.value))
</script>

<template>
  <div class="search-wrap">
    <input
      v-model="searchValue"
      class="input"
      type="search"
      placeholder="Search everything..."
      aria-label="Search characters, episodes and locations"
    />
    <div v-if="shouldRun" class="results card">
      <p v-if="fetching" class="hint" role="status" aria-live="polite" aria-atomic="true">
        Searching...
      </p>
      <p
        v-else-if="error && !hasNoResultsError"
        class="error"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Unable to run search right now.
      </p>
      <template v-else-if="hasResults">
        <div v-if="characters.length">
          <p class="section-label">Characters</p>
          <RouterLink
            v-for="character in characters"
            :key="character.id"
            class="result-link"
            :to="`/character/${character.id}`"
          >
            {{ character.name }}
          </RouterLink>
        </div>
        <div v-if="episodes.length">
          <p class="section-label">Episodes</p>
          <RouterLink
            v-for="episode in episodes"
            :key="episode.id"
            class="result-link"
            :to="`/episode/${episode.id}`"
          >
            {{ episode.episode }} - {{ episode.name }}
          </RouterLink>
        </div>
        <div v-if="locations.length">
          <p class="section-label">Locations</p>
          <RouterLink
            v-for="location in locations"
            :key="location.id"
            class="result-link"
            :to="`/location/${location.id}`"
          >
            {{ location.name }}
          </RouterLink>
        </div>
      </template>
      <p v-else class="hint" role="status" aria-live="polite" aria-atomic="true">
        No results for this query.
      </p>
    </div>
    <p
      v-else-if="searchValue.trim().length > 0"
      class="hint debounce-hint"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      Type at least 2 letters to search.
    </p>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  width: min(440px, 100%);
}

.results {
  position: absolute;
  top: calc(100% + 0.35rem);
  width: 100%;
  max-height: 24rem;
  overflow-y: auto;
  z-index: 20;
}

.section-label {
  margin: 0.3rem 0;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.result-link {
  display: block;
  text-decoration: none;
  color: var(--text-primary);
  padding: 0.25rem 0;
}

.result-link:hover,
.result-link:focus {
  color: var(--accent);
}

.debounce-hint {
  margin-top: 0.3rem;
}
</style>
