<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@urql/vue'
import PaginationControls from '@/components/PaginationControls.vue'
import { useDebouncedValue } from '@/composables/useDebouncedValue'
import { EPISODES_QUERY } from '@/lib/queries'
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
  set: (value: number) => void router.replace({ query: { ...route.query, page: String(value) } }),
})

const name = computed({
  get: () => String(route.query.name ?? ''),
  set: (value: string) => void router.replace({ query: { ...route.query, page: '1', name: value || undefined } }),
})

const season = computed({
  get: () => String(route.query.season ?? ''),
  set: (value: string) =>
    void router.replace({
      query: {
        ...route.query,
        page: '1',
        season: value || undefined,
      },
    }),
})

const episodeCode = computed(() => {
  if (!season.value) return undefined
  return `S${season.value.padStart(2, '0')}`
})

const debouncedName = useDebouncedValue(name, 300)

const hasShortTextFilter = computed(() => {
  const normalizedName = debouncedName.value.trim()
  return normalizedName.length > 0 && normalizedName.length < 2
})

const { data, fetching, error } = useQuery({
  query: EPISODES_QUERY,
  variables: computed(() => ({
    page: page.value,
    filter: {
      name: debouncedName.value || undefined,
      episode: episodeCode.value,
    },
  })),
  pause: hasShortTextFilter,
})

const episodes = computed(() => data.value?.episodes?.results ?? [])
const totalPages = computed(() => data.value?.episodes?.info?.pages ?? 1)
const totalCount = computed(() => data.value?.episodes?.info?.count ?? episodes.value.length)
const hasNoResultsError = computed(() => isNoResultsError(error.value))
</script>

<template>
  <section>
    <h1>Episodes Explorer</h1>
    <p class="description">Browse episodes by name or season, then jump into details or comparison.</p>

    <div class="card filters">
      <input v-model="name" class="input" placeholder="Episode name" />
      <select v-model="season" class="input">
        <option value="">All seasons</option>
        <option v-for="option in 7" :key="option" :value="String(option)">Season {{ option }}</option>
      </select>
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
          <RouterLink :to="`/episode/${episode.id}`" class="button">Open</RouterLink>
          <button
            class="button secondary"
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
          </button>
          <button
            class="button secondary"
            @click="
              compareStore.toggleEpisode({
                id: episode.id,
                name: episode.name,
                episode: episode.episode,
                air_date: episode.air_date,
              })
            "
          >
            Compare
          </button>
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
