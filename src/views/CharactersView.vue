<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@urql/vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { handleImageError } from '@/lib/image'
import { CHARACTERS_QUERY } from '@/lib/queries'
import { isNoResultsError } from '@/lib/errors'
import { useFavoritesStore } from '@/stores/favorites'
import { useCompareStore } from '@/stores/compare'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const compareStore = useCompareStore()
favoritesStore.hydrate()

const page = computed({
  get: () => Number(route.query.page ?? 1),
  set: (value: number) => {
    void router.replace({
      query: {
        ...route.query,
        page: String(value),
      },
    })
  },
})

const name = computed({
  get: () => String(route.query.name ?? ''),
  set: (value: string) => {
    void router.replace({ query: { ...route.query, page: '1', name: value || undefined } })
  },
})

const status = computed({
  get: () => String(route.query.status ?? ''),
  set: (value: string) => {
    void router.replace({ query: { ...route.query, page: '1', status: value || undefined } })
  },
})

const species = computed({
  get: () => String(route.query.species ?? ''),
  set: (value: string) => {
    void router.replace({ query: { ...route.query, page: '1', species: value || undefined } })
  },
})

const gender = computed({
  get: () => String(route.query.gender ?? ''),
  set: (value: string) => {
    void router.replace({ query: { ...route.query, page: '1', gender: value || undefined } })
  },
})

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

const { data, fetching, error } = useQuery({
  query: CHARACTERS_QUERY,
  variables: computed(() => ({ page: page.value, filter: filter.value })),
  pause: hasShortTextFilter,
})

const characters = computed(() => data.value?.characters?.results ?? [])
const totalPages = computed(() => data.value?.characters?.info?.pages ?? 1)
const hasNoResultsError = computed(() => isNoResultsError(error.value))

const resetFilters = () => {
  void router.replace({ query: { page: '1' } })
}
</script>

<template>
  <section>
    <h1>Characters Explorer</h1>
    <p class="description">Browse every character with URL-synced filters and compare-ready cards.</p>

    <div class="card filters">
      <input v-model="name" class="input" placeholder="Name" />
      <select v-model="status" class="input">
        <option value="">Any status</option>
        <option value="alive">Alive</option>
        <option value="dead">Dead</option>
        <option value="unknown">Unknown</option>
      </select>
      <input v-model="species" class="input" placeholder="Species" />
      <select v-model="gender" class="input">
        <option value="">Any gender</option>
        <option value="female">Female</option>
        <option value="male">Male</option>
        <option value="genderless">Genderless</option>
        <option value="unknown">Unknown</option>
      </select>
      <button class="button secondary" @click="resetFilters">Reset</button>
    </div>

    <p v-if="fetching" class="hint">Loading characters...</p>
    <p v-else-if="hasShortTextFilter" class="hint">Type at least 2 letters for name/species filters.</p>
    <p v-else-if="error && !hasNoResultsError" class="error">Unable to load character data right now.</p>
    <p v-else-if="!characters.length" class="hint">No characters match these filters.</p>

    <div v-else class="grid">
      <article v-for="character in characters" :key="character.id" class="card">
        <RouterLink class="image-link" :to="`/character/${character.id}`" :aria-label="`Open ${character.name}`">
          <img
            :src="character.image"
            :alt="character.name"
            class="avatar"
            loading="lazy"
            decoding="async"
            @error="handleImageError"
          />
        </RouterLink>
        <h3>{{ character.name }}</h3>
        <p class="meta">{{ character.species }} - {{ character.status }}</p>
        <p class="meta">Origin: {{ character.origin?.name || 'Unknown' }}</p>
        <div class="row">
          <RouterLink :to="`/character/${character.id}`" class="button">Open</RouterLink>
          <button
            class="button secondary"
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
          </button>
          <button
            class="button secondary"
            @click="
              compareStore.toggleCharacter({
                id: character.id,
                name: character.name,
                image: character.image,
                status: character.status,
                species: character.species,
              })
            "
          >
            Compare
          </button>
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
.filters {
  display: grid;
  gap: 0.6rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.description {
  color: var(--text-secondary);
}

.avatar {
  width: 100%;
  border-radius: 0.7rem;
  margin-bottom: 0.5rem;
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
