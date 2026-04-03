<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/AppButton.vue'
import { handleImageError } from '@/lib/image'
import { useFavoritesStore } from '@/stores/favorites'

const favoritesStore = useFavoritesStore()
favoritesStore.hydrate()

const hasFavorites = computed(() => favoritesStore.items.length > 0)

const pathFor = (kind: 'character' | 'episode' | 'location', id: string) => {
  if (kind === 'character') return `/character/${id}`
  if (kind === 'episode') return `/episode/${id}`
  return `/location/${id}`
}
</script>

<template>
  <section>
    <h1>Favorites</h1>
    <p class="description">Your saved picks are persisted locally and available after refresh.</p>

    <p v-if="!hasFavorites" class="hint">No favorites yet. Save some items from the explorers.</p>

    <div v-else class="grid">
      <h2 class="section-heading">Saved favorites ({{ favoritesStore.items.length }})</h2>
      <article v-for="item in favoritesStore.items" :key="`${item.kind}:${item.id}`" class="card">
        <RouterLink
          v-if="item.image"
          class="image-link"
          :to="pathFor(item.kind, item.id)"
          :aria-label="`Open ${item.name}`"
        >
          <img
            :src="item.image"
            :alt="item.name"
            loading="lazy"
            decoding="async"
            @error="handleImageError"
          />
        </RouterLink>
        <h3>{{ item.name }}</h3>
        <p class="meta">{{ item.subtitle }}</p>
        <div class="row">
          <AppButton :to="pathFor(item.kind, item.id)">Open</AppButton>
          <AppButton variant="secondary" @click="favoritesStore.toggle(item)">Remove</AppButton>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.description,
.meta {
  color: var(--text-secondary);
}

img {
  width: 100%;
  border-radius: 0.7rem;
}

.image-link {
  display: block;
}

.row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}
</style>
