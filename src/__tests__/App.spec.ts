import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFavoritesStore } from '@/stores/favorites'

describe('favorites store', () => {
  it('toggles items in and out', () => {
    setActivePinia(createPinia())
    const store = useFavoritesStore()

    store.toggle({
      id: '1',
      kind: 'character',
      name: 'Rick',
      subtitle: 'Human - Alive',
    })
    expect(store.items.length).toBe(1)
    expect(store.isFavorite('1', 'character')).toBe(true)

    store.toggle({
      id: '1',
      kind: 'character',
      name: 'Rick',
      subtitle: 'Human - Alive',
    })
    expect(store.items.length).toBe(0)
  })
})
