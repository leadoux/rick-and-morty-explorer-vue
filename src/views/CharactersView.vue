<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useUrlSyncedFilters } from '@/composables/useUrlSyncedFilters'
import { handleImageError } from '@/lib/image'
import { CHARACTERS_QUERY } from '@/lib/queries'
import { isNoResultsError } from '@/lib/errors'
import { useFavoritesStore } from '@/stores/favorites'
import { useCompareStore } from '@/stores/compare'

type CharacterCard = {
  id: string
  name: string
  status: string
  species: string
  gender: string
  image: string
  origin?: {
    name: string
  }
}

type CharactersQueryData = {
  characters?: {
    results?: CharacterCard[]
    info?: {
      pages?: number
      count?: number
    }
  }
}

const favoritesStore = useFavoritesStore()
const compareStore = useCompareStore()
favoritesStore.hydrate()

const { page, filters, resetFilters } = useUrlSyncedFilters({
  name: '',
  status: '',
  species: '',
  gender: '',
})
const { name, status, species, gender } = filters

const filter = computed(() => ({
  name: debouncedName.value || undefined,
  status: status.value || undefined,
  species: debouncedSpecies.value || undefined,
  gender: gender.value || undefined,
}))

const debouncedName = useDebouncedValue(name, 300)
const debouncedSpecies = useDebouncedValue(species, 300)

const hasShortTextFilter = computed(() => {
  const normalizedName = debouncedName.value.trim()
  const normalizedSpecies = debouncedSpecies.value.trim()
  return (
    (normalizedName.length > 0 && normalizedName.length < 2) ||
    (normalizedSpecies.length > 0 && normalizedSpecies.length < 2)
  )
})

const {
  items: characters,
  totalPages,
  totalCount,
  fetching,
  error,
} = usePaginatedQuery<
  CharactersQueryData,
  {
    page: number
    filter: {
      name?: string
      status?: string
      species?: string
      gender?: string
    }
  },
  CharacterCard
>({
  query: CHARACTERS_QUERY,
  variables: computed(() => ({ page: page.value, filter: filter.value })),
  pause: hasShortTextFilter,
  select: (data) => ({
    results: data?.characters?.results ?? [],
    pages: data?.characters?.info?.pages ?? 1,
    count: data?.characters?.info?.count ?? data?.characters?.results?.length ?? 0,
  }),
})
const hasNoResultsError = computed(() => isNoResultsError(error.value))
</script>

<template>
  <section>
    <h1>Characters Explorer</h1>
    <p class="description">
      Browse every character with URL-synced filters and compare-ready cards.
    </p>

    <fieldset class="card filters">
      <legend class="sr-only">Character filters</legend>
      <p id="characters-text-filter-hint" class="sr-only">
        Type at least 2 letters to search by name or species.
      </p>
      <label class="filter-field" for="character-name-filter">
        <span class="filter-label">Name</span>
        <input
          id="character-name-filter"
          v-model="name"
          class="input"
          placeholder="Name"
          aria-describedby="characters-text-filter-hint"
        />
      </label>
      <label class="filter-field" for="character-status-filter">
        <span class="filter-label">Status</span>
        <select id="character-status-filter" v-model="status" class="input">
          <option value="">Any status</option>
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <label class="filter-field" for="character-species-filter">
        <span class="filter-label">Species</span>
        <input
          id="character-species-filter"
          v-model="species"
          class="input"
          placeholder="Species"
          aria-describedby="characters-text-filter-hint"
        />
      </label>
      <label class="filter-field" for="character-gender-filter">
        <span class="filter-label">Gender</span>
        <select id="character-gender-filter" v-model="gender" class="input">
          <option value="">Any gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="genderless">Genderless</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <AppButton variant="secondary" type="button" aria-label="Reset character filters" @click="resetFilters">
        Reset
      </AppButton>
    </fieldset>

    <p v-if="fetching" class="hint" role="status" aria-live="polite" aria-atomic="true">
      Loading characters...
    </p>
    <p v-else-if="hasShortTextFilter" class="hint" role="status" aria-live="polite" aria-atomic="true">
      Type at least 2 letters for name/species filters.
    </p>
    <p
      v-else-if="error && !hasNoResultsError"
      class="error"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      Unable to load character data right now.
    </p>
    <p v-else-if="!characters.length" class="hint" role="status" aria-live="polite" aria-atomic="true">
      No characters match these filters.
    </p>

    <div v-else class="grid">
      <h2 class="section-heading">Character results ({{ totalCount }})</h2>
      <article v-for="character in characters" :key="character.id" class="card">
        <RouterLink
          class="image-link character-portrait-link"
          :to="`/character/${character.id}`"
          :aria-label="`Open ${character.name}`"
        >
          <img
            :src="character.image"
            :alt="character.name"
            width="300"
            height="300"
            loading="lazy"
            decoding="async"
            @error="handleImageError"
          />
        </RouterLink>
        <h3>{{ character.name }}</h3>
        <p class="meta">{{ character.species }} - {{ character.status }}</p>
        <p class="meta">Origin: {{ character.origin?.name || 'Unknown' }}</p>
        <div class="row">
          <AppButton :to="`/character/${character.id}`">Open</AppButton>
          <AppButton
            variant="secondary"
            @click="
              favoritesStore.toggle({
                id: character.id,
                kind: 'character',
                name: character.name,
                subtitle: `${character.species} - ${character.status}`,
                image: character.image,
              })
            "
          >
            {{ favoritesStore.isFavorite(character.id, 'character') ? 'Unfavorite' : 'Favorite' }}
          </AppButton>
          <AppButton
            variant="secondary"
            @click="
              compareStore.toggleCharacter({
                id: character.id,
                name: character.name,
                image: character.image,
                status: character.status,
                species: character.species,
              })
            "
            >Compare</AppButton
          >
        </div>
      </article>
    </div>

    <PaginationControls
      v-if="!fetching && characters.length"
      v-model="page"
      :total-pages="totalPages"
    />
  </section>
</template>

<style scoped>
.description {
  color: var(--text-secondary);
}

.image-link {
  display: block;
}

.meta {
  color: var(--text-secondary);
  margin: 0.2rem 0;
}

.row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.7rem;
}
</style>
