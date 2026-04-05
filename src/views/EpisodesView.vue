<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { usePaginatedQuery } from '@/composables/usePaginatedQuery'
import { useUrlSyncedFilters } from '@/composables/useUrlSyncedFilters'
import { EPISODES_QUERY } from '@/lib/queries'
import { isNoResultsError } from '@/lib/errors'
import { useFavoritesStore } from '@/stores/favorites'
import { useCompareStore } from '@/stores/compare'

type EpisodeCard = {
  id: string
  name: string
  air_date: string
  episode: string
  characters: Array<{ id: string; name: string }>
}

type EpisodesQueryData = {
  episodes?: {
    results?: EpisodeCard[]
    info?: {
      pages?: number
      count?: number
    }
  }
}

const favoritesStore = useFavoritesStore()
const compareStore = useCompareStore()
favoritesStore.hydrate()

const { page, filters } = useUrlSyncedFilters({
  name: '',
  season: '',
})
const { name, season } = filters

const episodeCode = computed(() => {
  if (!season.value) return undefined
  return `S${season.value.padStart(2, '0')}`
})

const debouncedName = useDebouncedValue(name, 300)

const hasShortTextFilter = computed(() => {
  const normalizedName = debouncedName.value.trim()
  return normalizedName.length > 0 && normalizedName.length < 2
})

const { items: episodes, totalPages, totalCount, fetching, error } = usePaginatedQuery<
  EpisodesQueryData,
  {
    page: number
    filter: {
      name?: string
      episode?: string
    }
  },
  EpisodeCard
>({
  query: EPISODES_QUERY,
  variables: computed(() => ({
    page: page.value,
    filter: {
      name: debouncedName.value || undefined,
      episode: episodeCode.value,
    },
  })),
  pause: hasShortTextFilter,
  select: (data) => ({
    results: data?.episodes?.results ?? [],
    pages: data?.episodes?.info?.pages ?? 1,
    count: data?.episodes?.info?.count ?? (data?.episodes?.results?.length ?? 0),
  }),
})
const hasNoResultsError = computed(() => isNoResultsError(error.value))
</script>

<template>
  <section>
    <h1>Episodes Explorer</h1>
    <p class="description">Browse episodes by name or season, then jump into details or comparison.</p>

    <div class="card filters">
      <label class="filter-field" for="episode-name-filter">
        <span class="filter-label">Episode name</span>
        <input id="episode-name-filter" v-model="name" class="input" placeholder="Episode name" />
      </label>
      <label class="filter-field" for="episode-season-filter">
        <span class="filter-label">Season</span>
        <select id="episode-season-filter" v-model="season" class="input">
          <option value="">All seasons</option>
          <option v-for="option in 7" :key="option" :value="String(option)">Season {{ option }}</option>
        </select>
      </label>
    </div>

    <p v-if="fetching" class="hint">Loading episodes...</p>
    <p v-else-if="hasShortTextFilter" class="hint">Type at least 2 letters for episode name.</p>
    <p v-else-if="error && !hasNoResultsError" class="error">Unable to load episode data.</p>
    <p v-else-if="!episodes.length" class="hint">No episodes match these filters.</p>

    <div v-else class="grid">
      <h2 class="section-heading">Episode results ({{ totalCount }})</h2>
      <article v-for="episode in episodes" :key="episode.id" class="card">
        <h3>{{ episode.episode }} - {{ episode.name }}</h3>
        <p class="meta">Air date: {{ episode.air_date }}</p>
        <p class="meta">Characters: {{ episode.characters.length }}</p>
        <div class="row">
          <AppButton :to="`/episode/${episode.id}`">Open</AppButton>
          <AppButton
            variant="secondary"
            @click="
              favoritesStore.toggle({
                id: episode.id,
                kind: 'episode',
                name: episode.name,
                subtitle: `${episode.episode} - ${episode.air_date}`,
              })
            "
          >
            {{ favoritesStore.isFavorite(episode.id, 'episode') ? 'Unfavorite' : 'Favorite' }}
          </AppButton>
          <AppButton
            variant="secondary"
            @click="
              compareStore.toggleEpisode({
                id: episode.id,
                name: episode.name,
                episode: episode.episode,
                air_date: episode.air_date,
              })
            "
          >Compare</AppButton>
        </div>
      </article>
    </div>

    <PaginationControls
      v-if="!fetching && episodes.length"
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

.filter-field {
  display: grid;
  gap: 0.25rem;
}

.filter-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.description,
.meta {
  color: var(--text-secondary);
}

.row {
  margin-top: 0.7rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
