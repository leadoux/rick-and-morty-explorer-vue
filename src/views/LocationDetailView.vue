<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@urql/vue'
import { handleImageError } from '@/lib/image'
import { LOCATION_DETAIL_QUERY } from '@/lib/queries'
import { useFavoritesStore } from '@/stores/favorites'

const props = defineProps<{ id: string }>()
const favoritesStore = useFavoritesStore()
favoritesStore.hydrate()

const { data, fetching, error } = useQuery({
  query: LOCATION_DETAIL_QUERY,
  variables: computed(() => ({ id: props.id })),
})

const location = computed(() => data.value?.location)
</script>

<template>
  <section>
    <p v-if="fetching" class="hint">Loading location...</p>
    <p v-else-if="error" class="error">Unable to load this location.</p>

    <article v-else-if="location" class="card">
      <h1>{{ location.name }}</h1>
      <p class="meta">Type: {{ location.type || 'Unknown' }}</p>
      <p class="meta">Dimension: {{ location.dimension || 'Unknown' }}</p>
      <p class="meta">Residents: {{ location.residents.length }}</p>
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

      <h2>Residents</h2>
      <div class="grid">
        <article v-for="resident in location.residents" :key="resident.id" class="card resident">
          <RouterLink class="image-link" :to="`/character/${resident.id}`" :aria-label="`Open ${resident.name}`">
            <img
              :src="resident.image"
              :alt="resident.name"
              loading="lazy"
              decoding="async"
              @error="handleImageError"
            />
          </RouterLink>
          <h3>{{ resident.name }}</h3>
          <p class="meta">{{ resident.species }} - {{ resident.status }}</p>
          <RouterLink class="button" :to="`/character/${resident.id}`">Open</RouterLink>
        </article>
      </div>
    </article>
  </section>
</template>

<style scoped>
.meta {
  color: var(--text-secondary);
}

button {
  margin-top: 0.5rem;
}

.resident img {
  width: 100%;
  border-radius: 0.7rem;
}

.image-link {
  display: block;
}
</style>
