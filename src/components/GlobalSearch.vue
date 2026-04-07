<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@urql/vue'
import { useRouter } from 'vue-router'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { GLOBAL_SEARCH_QUERY } from '@/lib/queries'
import { isNoResultsError } from '@/lib/errors'

const searchValue = ref('')
const debouncedSearchValue = useDebouncedValue(searchValue, 350)
const shouldRun = computed(() => debouncedSearchValue.value.trim().length >= 2)
const isOpen = ref(false)
const searchWrapRef = ref<HTMLElement | null>(null)
const router = useRouter()

type SearchOption = {
  id: string
  label: string
  path: string
  group: 'Characters' | 'Episodes' | 'Locations'
}

type CharacterSearchResult = {
  id: string
  name: string
}

type EpisodeSearchResult = {
  id: string
  name: string
  episode: string
}

type LocationSearchResult = {
  id: string
  name: string
}

const { data, fetching, error } = useQuery({
  query: GLOBAL_SEARCH_QUERY,
  variables: computed(() => ({
    name: debouncedSearchValue.value.trim(),
  })),
  pause: computed(() => !shouldRun.value),
})

const characters = computed<CharacterSearchResult[]>(() => (data.value?.characters?.results ?? []).slice(0, 5))
const episodes = computed<EpisodeSearchResult[]>(() => (data.value?.episodes?.results ?? []).slice(0, 5))
const locations = computed<LocationSearchResult[]>(() => (data.value?.locations?.results ?? []).slice(0, 5))

const hasResults = computed(() => {
  return characters.value.length > 0 || episodes.value.length > 0 || locations.value.length > 0
})

const flattenedOptions = computed<SearchOption[]>(() => {
  const characterOptions = characters.value.map((character) => ({
    id: `character-${character.id}`,
    label: character.name,
    path: `/character/${character.id}`,
    group: 'Characters' as const,
  }))
  const episodeOptions = episodes.value.map((episode) => ({
    id: `episode-${episode.id}`,
    label: `${episode.episode} - ${episode.name}`,
    path: `/episode/${episode.id}`,
    group: 'Episodes' as const,
  }))
  const locationOptions = locations.value.map((location) => ({
    id: `location-${location.id}`,
    label: location.name,
    path: `/location/${location.id}`,
    group: 'Locations' as const,
  }))

  return [...characterOptions, ...episodeOptions, ...locationOptions]
})

const activeOptionIndex = ref(-1)
const listboxId = 'global-search-listbox'

const activeOptionId = computed(() => {
  if (activeOptionIndex.value < 0) return undefined
  const option = flattenedOptions.value[activeOptionIndex.value]
  return option ? `search-option-${option.id}` : undefined
})

/** Panel is “expanded” whenever the user has the dropdown open with a non-empty query. */
const isPanelVisible = computed(() => isOpen.value && searchValue.value.trim().length > 0)

const clearActiveOption = () => {
  activeOptionIndex.value = -1
}

const closeDropdown = () => {
  isOpen.value = false
  clearActiveOption()
}

const onFocusIn = () => {
  if (shouldRun.value || searchValue.value.trim().length > 0) {
    isOpen.value = true
  }
}

const onFocusOut = (event: FocusEvent) => {
  const nextFocusedElement = event.relatedTarget as Node | null
  if (searchWrapRef.value?.contains(nextFocusedElement)) return
  closeDropdown()
}

const onKeydown = async (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    if (isOpen.value) {
      closeDropdown()
      return
    }
    if (searchValue.value.trim().length > 0) {
      searchValue.value = ''
    }
    return
  }

  if (!shouldRun.value || !flattenedOptions.value.length) return

  if (!isOpen.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    isOpen.value = true
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (activeOptionIndex.value < 0) {
      activeOptionIndex.value = 0
      return
    }
    activeOptionIndex.value = (activeOptionIndex.value + 1) % flattenedOptions.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (activeOptionIndex.value < 0) {
      activeOptionIndex.value = flattenedOptions.value.length - 1
      return
    }
    activeOptionIndex.value =
      activeOptionIndex.value <= 0 ? flattenedOptions.value.length - 1 : activeOptionIndex.value - 1
    return
  }

  if (event.key === 'Enter' && activeOptionIndex.value >= 0) {
    event.preventDefault()
    const option = flattenedOptions.value[activeOptionIndex.value]
    if (!option) return
    await router.push(option.path)
    closeDropdown()
    return
  }
}

watch(searchValue, () => {
  clearActiveOption()
  const trimmed = searchValue.value.trim()
  if (trimmed.length === 0) {
    isOpen.value = false
  } else {
    isOpen.value = true
  }
})

watch(shouldRun, (nextShouldRun) => {
  if (!nextShouldRun) {
    if (searchValue.value.trim().length === 0) {
      closeDropdown()
    }
    return
  }
  if (searchValue.value.trim().length >= 2) {
    isOpen.value = true
  }
})

watch(
  flattenedOptions,
  (nextOptions) => {
    if (!nextOptions.length) {
      clearActiveOption()
      return
    }

    if (activeOptionIndex.value >= nextOptions.length) {
      activeOptionIndex.value = nextOptions.length - 1
      return
    }

    // When results appear while the panel is open, initialize an active option
    // so arrow navigation and SR announcements behave consistently.
    if (isPanelVisible.value && activeOptionIndex.value < 0) {
      activeOptionIndex.value = 0
    }
  },
  { immediate: true },
)

const hasNoResultsError = computed(() => isNoResultsError(error.value))
</script>

<template>
  <div ref="searchWrapRef" class="search-wrap" @focusin="onFocusIn" @focusout="onFocusOut">
    <input
      v-model="searchValue"
      class="input"
      type="search"
      placeholder="Search everything..."
      aria-label="Search characters, episodes and locations"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="isPanelVisible ? 'true' : 'false'"
      :aria-controls="isPanelVisible ? listboxId : undefined"
      :aria-activedescendant="activeOptionId"
      @keydown="onKeydown"
    />
    <div
      v-if="isPanelVisible"
      :id="listboxId"
      class="results card"
      :role="shouldRun ? 'listbox' : undefined"
    >
      <template v-if="!shouldRun">
        <p class="hint debounce-hint" role="status" aria-live="polite" aria-atomic="true">
          Type at least 2 letters to search.
        </p>
      </template>
      <template v-else>
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
              role="option"
              :id="`search-option-character-${character.id}`"
              :aria-selected="activeOptionId === `search-option-character-${character.id}` ? 'true' : 'false'"
              :class="{ active: activeOptionId === `search-option-character-${character.id}` }"
              tabindex="-1"
              @mouseenter="
                activeOptionIndex = flattenedOptions.findIndex((option) => option.id === `character-${character.id}`)
              "
              @click="closeDropdown"
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
              role="option"
              :id="`search-option-episode-${episode.id}`"
              :aria-selected="activeOptionId === `search-option-episode-${episode.id}` ? 'true' : 'false'"
              :class="{ active: activeOptionId === `search-option-episode-${episode.id}` }"
              tabindex="-1"
              @mouseenter="
                activeOptionIndex = flattenedOptions.findIndex((option) => option.id === `episode-${episode.id}`)
              "
              @click="closeDropdown"
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
              role="option"
              :id="`search-option-location-${location.id}`"
              :aria-selected="activeOptionId === `search-option-location-${location.id}` ? 'true' : 'false'"
              :class="{ active: activeOptionId === `search-option-location-${location.id}` }"
              tabindex="-1"
              @mouseenter="
                activeOptionIndex = flattenedOptions.findIndex((option) => option.id === `location-${location.id}`)
              "
              @click="closeDropdown"
            >
              {{ location.name }}
            </RouterLink>
          </div>
        </template>
        <p v-else class="hint" role="status" aria-live="polite" aria-atomic="true">
          No results for this query.
        </p>
      </template>
    </div>
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

.result-link.active {
  color: var(--accent);
  text-decoration: underline;
}

.debounce-hint {
  margin-top: 0.3rem;
}
</style>
