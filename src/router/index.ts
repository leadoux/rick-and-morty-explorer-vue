import { createRouter, createWebHistory } from 'vue-router'
import {
  characterDetailGenericDescription,
  charactersPageDescription,
  comparePageDescription,
  defaultSiteDescription,
  episodeDetailGenericDescription,
  episodesPageDescription,
  favoritesPageDescription,
  locationDetailGenericDescription,
  locationsPageDescription,
  notFoundPageDescription,
} from '@/lib/seo'
import CharactersView from '@/views/CharactersView.vue'
import EpisodesView from '@/views/EpisodesView.vue'
import LocationsView from '@/views/LocationsView.vue'
import CharacterDetailView from '@/views/CharacterDetailView.vue'
import EpisodeDetailView from '@/views/EpisodeDetailView.vue'
import LocationDetailView from '@/views/LocationDetailView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import CompareView from '@/views/CompareView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/characters',
      meta: {
        title: 'Rick and Morty Explorer',
        description: defaultSiteDescription,
      },
    },
    {
      path: '/characters',
      name: 'characters',
      component: CharactersView,
      meta: {
        title: 'Characters | Rick and Morty Explorer',
        description: charactersPageDescription,
      },
    },
    {
      path: '/episodes',
      name: 'episodes',
      component: EpisodesView,
      meta: {
        title: 'Episodes | Rick and Morty Explorer',
        description: episodesPageDescription,
      },
    },
    {
      path: '/locations',
      name: 'locations',
      component: LocationsView,
      meta: {
        title: 'Locations | Rick and Morty Explorer',
        description: locationsPageDescription,
      },
    },
    {
      path: '/character/:id',
      name: 'character-detail',
      component: CharacterDetailView,
      props: true,
      meta: {
        title: 'Character Details | Rick and Morty Explorer',
        description: characterDetailGenericDescription,
      },
    },
    {
      path: '/episode/:id',
      name: 'episode-detail',
      component: EpisodeDetailView,
      props: true,
      meta: {
        title: 'Episode Details | Rick and Morty Explorer',
        description: episodeDetailGenericDescription,
      },
    },
    {
      path: '/location/:id',
      name: 'location-detail',
      component: LocationDetailView,
      props: true,
      meta: {
        title: 'Location Details | Rick and Morty Explorer',
        description: locationDetailGenericDescription,
      },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
      meta: {
        title: 'Favorites | Rick and Morty Explorer',
        description: favoritesPageDescription,
      },
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareView,
      meta: {
        title: 'Compare | Rick and Morty Explorer',
        description: comparePageDescription,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: {
        title: 'Page Not Found | Rick and Morty Explorer',
        description: notFoundPageDescription,
      },
    },
  ],
})

export default router
