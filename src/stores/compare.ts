import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type CompareCharacter = {
  id: string
  name: string
  image: string
  status: string
  species: string
}

export type CompareEpisode = {
  id: string
  name: string
  episode: string
  air_date: string
}

export const useCompareStore = defineStore('compare', () => {
  const characters = ref<CompareCharacter[]>([])
  const episodes = ref<CompareEpisode[]>([])

  const canCompareCharacters = computed(() => characters.value.length === 2)
  const canCompareEpisodes = computed(() => episodes.value.length === 2)

  const toggleCharacter = (value: CompareCharacter) => {
    const index = characters.value.findIndex((item) => item.id === value.id)
    if (index > -1) {
      characters.value.splice(index, 1)
      return
    }
    if (characters.value.length === 2) {
      characters.value.shift()
    }
    characters.value.push(value)
  }

  const toggleEpisode = (value: CompareEpisode) => {
    const index = episodes.value.findIndex((item) => item.id === value.id)
    if (index > -1) {
      episodes.value.splice(index, 1)
      return
    }
    if (episodes.value.length === 2) {
      episodes.value.shift()
    }
    episodes.value.push(value)
  }

  return {
    characters,
    episodes,
    canCompareCharacters,
    canCompareEpisodes,
    toggleCharacter,
    toggleEpisode,
  }
})
