<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useUrlSyncedFilters } from '@/composables/useUrlSyncedFilters'
import { LOCATIONS_QUERY } from '@/lib/queries'
import { isNoResultsError } from '@/lib/errors'
import { useFavoritesStore } from '@/stores/favorites'

type LocationCard = {
  id: string
  name: string
  type: string
  dimension: string
  residents: Array<{ id: string; name: string }>
}

type LocationsQueryData = {
  locations?: {
    results?: LocationCard[]
    info?: {
      pages?: number
      count?: number
    }
  }
}

const favoritesStore = useFavoritesStore()
favoritesStore.hydrate()

const { page, filters } = useUrlSyncedFilters({
  name: '',
  type: '',
  dimension: '',
})
const { name, type, dimension } = filters

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

const { items: locations, totalPages, totalCount, fetching, error } = usePaginatedQuery<
  LocationsQueryData,
  {
    page: number
    filter: {
      name?: string
      type?: string
      dimension?: string
    }
  },
  LocationCard
>({
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
  select: (data) => ({
    results: data?.locations?.results ?? [],
    pages: data?.locations?.info?.pages ?? 1,
    count: data?.locations?.info?.count ?? (data?.locations?.results?.length ?? 0),
  }),
})
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
      <h2 class="section-heading">Location results ({{ totalCount }})</h2>
      <article v-for="location in locations" :key="location.id" class="card">
        <h3>{{ location.name }}</h3>
        <p class="meta">Type: {{ location.type || 'Unknown' }}</p>
        <p class="meta">Dimension: {{ location.dimension || 'Unknown' }}</p>
        <p class="meta">Residents: {{ location.residents.length }}</p>
        <div class="row">
          <AppButton :to="`/location/${location.id}`">Open</AppButton>
          <AppButton
            variant="secondary"
            @click="
              favoritesStore.toggle({
                id: location.id,
                kind: 'location',
                name: location.name,
                subtitle: `${location.type || 'Unknown'} - ${location.dimension || 'Unknown'}`,
              })
            "
          >{{ favoritesStore.isFavorite(location.id, 'location') ? 'Unfavorite' : 'Favorite' }}</AppButton>
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
