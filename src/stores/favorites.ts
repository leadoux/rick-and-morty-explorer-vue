import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { EntityKind } from '@/types/entities'

const FAVORITES_STORAGE_KEY = 'rm-favorites'

export type FavoriteItem = {
  id: string
  kind: EntityKind
  name: string
  subtitle: string
  image?: string
}

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<FavoriteItem[]>([])

  const byKind = computed(() => {
    return {
      characters: items.value.filter((item) => item.kind === 'character'),
      episodes: items.value.filter((item) => item.kind === 'episode'),
      locations: items.value.filter((item) => item.kind === 'location'),
    }
  })

  const keyFor = (id: string, kind: EntityKind) => `${kind}:${id}`

  const hydrate = () => {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as FavoriteItem[]
      items.value = parsed
    } catch {
      items.value = []
    }
  }

  const isFavorite = (id: string, kind: EntityKind) => {
    return items.value.some((item) => keyFor(item.id, item.kind) === keyFor(id, kind))
  }

  const toggle = (item: FavoriteItem) => {
    const existingIndex = items.value.findIndex(
      (entry) => keyFor(entry.id, entry.kind) === keyFor(item.id, item.kind),
    )

    if (existingIndex > -1) {
      items.value.splice(existingIndex, 1)
      return
    }
    items.value.unshift(item)
  }

  watch(
    items,
    (nextItems) => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextItems))
    },
    { deep: true },
  )

  return {
    items,
    byKind,
    hydrate,
    isFavorite,
    toggle,
  }
})
