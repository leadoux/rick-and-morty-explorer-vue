<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import { useQuery } from '@urql/vue'
import { useHead } from '@vueuse/head'
import { handleImageError } from '@/lib/image'
import { episodeDetailGenericDescription } from '@/lib/seo'
import { EPISODE_DETAIL_QUERY } from '@/lib/queries'
import { useFavoritesStore } from '@/stores/favorites'
import { useCompareStore } from '@/stores/compare'

const props = defineProps<{ id: string }>()
const favoritesStore = useFavoritesStore()
const compareStore = useCompareStore()
favoritesStore.hydrate()

const { data, fetching, error } = useQuery({
  query: EPISODE_DETAIL_QUERY,
  variables: computed(() => ({ id: props.id })),
})

const episode = computed(() => data.value?.episode)

const pageHeading = computed(() =>
  episode.value ? `${episode.value.episode} - ${episode.value.name}` : 'Episode details',
)

useHead(
  computed(() => ({
    title: episode.value?.name
      ? `${episode.value.episode} - ${episode.value.name} | Rick and Morty Explorer`
      : 'Episode Details | Rick and Morty Explorer',
    meta: [
      {
        name: 'description',
        key: 'description',
        content: episode.value
          ? `${episode.value.episode} ${episode.value.name}: air date, characters, and compare from Rick and Morty Explorer.`
          : episodeDetailGenericDescription,
      },
    ],
  })),
)
</script>

<template>
  <section>
    <h1 class="page-heading">{{ pageHeading }}</h1>
    <p v-if="fetching" class="hint" role="status" aria-live="polite" aria-atomic="true">
      Loading episode...
    </p>
    <p v-else-if="error" class="error" role="status" aria-live="polite" aria-atomic="true">
      Unable to load this episode.
    </p>

    <article v-else-if="episode" class="card">
      <p class="meta">Air date: {{ episode.air_date }}</p>
      <p class="meta">Character count: {{ episode.characters.length }}</p>

      <div class="row">
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
        >{{ favoritesStore.isFavorite(episode.id, 'episode') ? 'Unfavorite' : 'Favorite' }}</AppButton>
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

      <h2>Characters</h2>
      <div class="grid">
        <article v-for="character in episode.characters" :key="character.id" class="card resident">
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
          <AppButton :to="`/character/${character.id}`">Open</AppButton>
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

.row {
  margin: 0.8rem 0;
  display: flex;
  gap: 0.5rem;
}

.image-link {
  display: block;
}
</style>
