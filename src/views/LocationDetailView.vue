<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import { useQuery } from '@urql/vue'
import { useHead } from '@vueuse/head'
import { handleImageError } from '@/lib/image'
import { locationDetailGenericDescription } from '@/lib/seo'
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

const pageHeading = computed(() => location.value?.name ?? 'Location details')

useHead(
  computed(() => ({
    title: location.value?.name
      ? `${location.value.name} | Rick and Morty Explorer`
      : 'Location Details | Rick and Morty Explorer',
    meta: [
      {
        name: 'description',
        key: 'description',
        content: location.value
          ? `Location ${location.value.name}: type, dimension, and residents from Rick and Morty Explorer.`
          : locationDetailGenericDescription,
      },
    ],
  })),
)
</script>

<template>
  <section>
    <h1 class="page-heading">{{ pageHeading }}</h1>
    <p v-if="fetching" class="hint" role="status" aria-live="polite" aria-atomic="true">
      Loading location...
    </p>
    <p v-else-if="error" class="error" role="status" aria-live="polite" aria-atomic="true">
      Unable to load this location.
    </p>

    <article v-else-if="location" class="card">
      <p class="meta">Type: {{ location.type || 'Unknown' }}</p>
      <p class="meta">Dimension: {{ location.dimension || 'Unknown' }}</p>
      <p class="meta">Residents: {{ location.residents.length }}</p>
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

      <h2>Residents</h2>
      <div class="grid">
        <article v-for="resident in location.residents" :key="resident.id" class="card resident">
          <RouterLink
            class="image-link character-portrait-link"
            :to="`/character/${resident.id}`"
            :aria-label="`Open ${resident.name}`"
          >
            <img
              :src="resident.image"
              :alt="resident.name"
              width="300"
              height="300"
              loading="lazy"
              decoding="async"
              @error="handleImageError"
            />
          </RouterLink>
          <h3>{{ resident.name }}</h3>
          <p class="meta">{{ resident.species }} - {{ resident.status }}</p>
          <AppButton :to="`/character/${resident.id}`">Open</AppButton>
        </article>
      </div>
    </article>
  </section>
</template>

<style scoped>
.page-heading {
  margin: 0 0 0.75rem;
}

.meta {
  color: var(--text-secondary);
}

button {
  margin-top: 0.5rem;
}

.image-link {
  display: block;
}
</style>
