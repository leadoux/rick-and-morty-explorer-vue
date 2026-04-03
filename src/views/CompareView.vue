<script setup lang="ts">
import { computed, ref } from 'vue'
import { handleImageError } from '@/lib/image'
import { useCompareStore } from '@/stores/compare'

const compareStore = useCompareStore()
const tab = ref<'characters' | 'episodes'>('characters')

const canCompare = computed(() => {
  if (tab.value === 'characters') return compareStore.canCompareCharacters
  return compareStore.canCompareEpisodes
})
</script>

<template>
  <section>
    <h1>Compare</h1>
    <p class="description">Pick two items from explorer pages and compare them side-by-side here.</p>

    <div class="row">
      <button class="button secondary" :disabled="tab === 'characters'" @click="tab = 'characters'">
        Characters
      </button>
      <button class="button secondary" :disabled="tab === 'episodes'" @click="tab = 'episodes'">
        Episodes
      </button>
    </div>

    <p v-if="!canCompare" class="hint">Add two {{ tab }} to start comparing.</p>

    <div v-else-if="tab === 'characters'" class="compare-grid">
      <article v-for="character in compareStore.characters" :key="character.id" class="card">
        <RouterLink class="image-link" :to="`/character/${character.id}`" :aria-label="`Open ${character.name}`">
          <img
            :src="character.image"
            :alt="character.name"
            loading="lazy"
            decoding="async"
            @error="handleImageError"
          />
        </RouterLink>
        <h3>{{ character.name }}</h3>
        <p class="meta">Status: {{ character.status }}</p>
        <p class="meta">Species: {{ character.species }}</p>
      </article>
    </div>

    <div v-else class="compare-grid">
      <article v-for="episode in compareStore.episodes" :key="episode.id" class="card">
        <h3>{{ episode.name }}</h3>
        <p class="meta">Episode: {{ episode.episode }}</p>
        <p class="meta">Air date: {{ episode.air_date }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.description,
.meta {
  color: var(--text-secondary);
}

.row {
  margin: 0.8rem 0;
  display: flex;
  gap: 0.5rem;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

img {
  width: 100%;
  border-radius: 0.7rem;
}

.image-link {
  display: block;
}
</style>
