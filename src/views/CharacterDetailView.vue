<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import { useQuery } from '@urql/vue'
import { useHead } from '@vueuse/head'
import { handleImageError } from '@/lib/image'
import { characterDetailGenericDescription } from '@/lib/seo'
import { CHARACTER_DETAIL_QUERY } from '@/lib/queries'
import { useFavoritesStore } from '@/stores/favorites'
import { useCompareStore } from '@/stores/compare'

const props = defineProps<{ id: string }>()
const favoritesStore = useFavoritesStore()
const compareStore = useCompareStore()
favoritesStore.hydrate()

const { data, fetching, error } = useQuery({
  query: CHARACTER_DETAIL_QUERY,
  variables: computed(() => ({ id: props.id })),
})

const character = computed(() => data.value?.character)

const pageHeading = computed(() => character.value?.name ?? 'Character details')

useHead(
  computed(() => ({
    title: character.value?.name
      ? `${character.value.name} | Rick and Morty Explorer`
      : 'Character Details | Rick and Morty Explorer',
    meta: [
      {
        name: 'description',
        key: 'description',
        content: character.value
          ? `Profile for ${character.value.name}: ${character.value.species}, ${character.value.status}. Episode list and links from Rick and Morty Explorer.`
          : characterDetailGenericDescription,
      },
    ],
  })),
)
</script>

<template>
  <section>
    <h1 class="page-heading">{{ pageHeading }}</h1>
    <p v-if="fetching" class="hint" role="status" aria-live="polite" aria-atomic="true">
      Loading character...
    </p>
    <p v-else-if="error" class="error" role="status" aria-live="polite" aria-atomic="true">
      Unable to load this character.
    </p>

    <article v-else-if="character" class="card detail">
      <img
        :src="character.image"
        :alt="character.name"
        fetchpriority="high"
        loading="eager"
        decoding="async"
        @error="handleImageError"
      />
      <div>
        <p class="meta">Status: {{ character.status }}</p>
        <p class="meta">Species: {{ character.species }}</p>
        <p class="meta">Gender: {{ character.gender }}</p>
        <p class="meta">Origin: {{ character.origin?.name || 'Unknown' }}</p>
        <p class="meta">Last known location: {{ character.location?.name || 'Unknown' }}</p>

        <div class="row">
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
            >{{
              favoritesStore.isFavorite(character.id, 'character') ? 'Unfavorite' : 'Favorite'
            }}</AppButton
          >
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

        <h2>Episode Appearances</h2>
        <ul>
          <li v-for="episode in character.episode" :key="episode.id">
            <RouterLink :to="`/episode/${episode.id}`">{{ episode.name }}</RouterLink>
          </li>
        </ul>
      </div>
    </article>
  </section>
</template>

<style scoped>
.page-heading {
  margin: 0 0 0.75rem;
}

.detail {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

img {
  width: min(100%, 360px);
  border-radius: 0.8rem;
}

.meta {
  color: var(--text-secondary);
  margin: 0.2rem 0;
}

.row {
  display: flex;
  gap: 0.5rem;
  margin: 0.8rem 0;
  flex-wrap: wrap;
}

ul {
  margin: 0.5rem 0 0;
  padding-left: 1.2rem;
}

@media (min-width: 900px) {
  .detail {
    grid-template-columns: 360px 1fr;
  }
}
</style>
