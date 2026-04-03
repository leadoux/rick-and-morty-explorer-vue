<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@urql/vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { LOCATIONS_QUERY } from '@/lib/queries'
import { isNoResultsError } from '@/lib/errors'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()
favoritesStore.hydrate()

const page = computed({
  get: () => Number(route.query.page ?? 1),
  set: (value: number) => void router.replace({ query: { ...route.query, page: String(value) } }),
})

const name = computed({
  get: () => String(route.query.name ?? ''),
  set: (value: string) => void router.replace({ query: { ...route.query, page: '1', name: value || undefined } }),
})

const type = computed({
  get: () => String(route.query.type ?? ''),
  set: (value: string) => void router.replace({ query: { ...route.query, page: '1', type: value || undefined } }),
})

const dimension = computed({
  get: () => String(route.query.dimension ?? ''),
  set: (value: string) =>
    void router.replace({
      query: { ...route.query, page: '1', dimension: value || undefined },
    }),
})

const debouncedName = useDebouncedValue(name, 300)
const debouncedType = useDebouncedValue(type, 300)
const debouncedDimension = useDebouncedValue(dimension, 300)

const hasShortTextFilter = computed(() => {
  const normalizedName = debouncedName.value.trim()
  const normalizedType = debouncedType.value.trim()
  const normalizedDimension = debouncedDimension.value.trim()
  return (
    (normalizedName.length > 0 && normalizedName.length < 2) ||
    (normalizedType.length > 0 && normalizedType.length < 2) ||
    (normalizedDimension.length > 0 && normalizedDimension.length < 2)
  )
})

const { data, fetching, error } = useQuery({
  query: LOCATIONS_QUERY,
  variables: computed(() => ({
    page: page.value,
    filter: {
      name: debouncedName.value || undefined,
      type: debouncedType.value || undefined,
      dimension: debouncedDimension.value || undefined,
    },
  })),
  pause: hasShortTextFilter,
})

const locations = computed(() => data.value?.locations?.results ?? [])
const totalPages = computed(() => data.value?.locations?.info?.pages ?? 1)
const hasNoResultsError = computed(() => isNoResultsError(error.value))
</script>

<template>
  <section>
    <h1>Locations Explorer</h1>
    <p class="description">Filter by location type and dimension for quick world discovery.</p>

    <div class="card filters">
      <input v-model="name" class="input" placeholder="Location name" />
      <input v-model="type" class="input" placeholder="Type" />
      <input v-model="dimension" class="input" placeholder="Dimension" />
    </div>

    <p v-if="fetching" class="hint">Loading locations...</p>
    <p v-else-if="hasShortTextFilter" class="hint">Type at least 2 letters for text filters.</p>
    <p v-else-if="error && !hasNoResultsError" class="error">Unable to load locations.</p>
    <p v-else-if="!locations.length" class="hint">No locations match these filters.</p>

    <div v-else class="grid">
      <article v-for="location in locations" :key="location.id" class="card">
        <h3>{{ location.name }}</h3>
        <p class="meta">Type: {{ location.type || 'Unknown' }}</p>
        <p class="meta">Dimension: {{ location.dimension || 'Unknown' }}</p>
        <p class="meta">Residents: {{ location.residents.length }}</p>
        <div class="row">
          <RouterLink :to="`/location/${location.id}`" class="button">Open</RouterLink>
          <button
            class="button secondary"
            @click="
              favoritesStore.toggle({
                id: location.id,
                kind: 'location',
                name: location.name,
                subtitle: `${location.type || 'Unknown'} - ${location.dimension || 'Unknown'}`,
              })
            "
          >
            {{ favoritesStore.isFavorite(location.id, 'location') ? 'Unfavorite' : 'Favorite' }}
          </button>
        </div>
      </article>
    </div>

    <PaginationControls
      v-if="!fetching && locations.length"
      v-model="page"
      :total-pages="totalPages"
    />
  </section>
</template>

<style scoped>
.filters {
  display: grid;
  gap: 0.6rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.description,
.meta {
  color: var(--text-secondary);
}

.row {
  margin-top: 0.7rem;
  display: flex;
  gap: 0.5rem;
}
</style>
