import { createRouter, createWebHistory } from 'vue-router'
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
      },
    },
    {
      path: '/characters',
      name: 'characters',
      component: CharactersView,
      meta: {
        title: 'Characters | Rick and Morty Explorer',
      },
    },
    {
      path: '/episodes',
      name: 'episodes',
      component: EpisodesView,
      meta: {
        title: 'Episodes | Rick and Morty Explorer',
      },
    },
    {
      path: '/locations',
      name: 'locations',
      component: LocationsView,
      meta: {
        title: 'Locations | Rick and Morty Explorer',
      },
    },
    {
      path: '/character/:id',
      name: 'character-detail',
      component: CharacterDetailView,
      props: true,
      meta: {
        title: 'Character Details | Rick and Morty Explorer',
      },
    },
    {
      path: '/episode/:id',
      name: 'episode-detail',
      component: EpisodeDetailView,
      props: true,
      meta: {
        title: 'Episode Details | Rick and Morty Explorer',
      },
    },
    {
      path: '/location/:id',
      name: 'location-detail',
      component: LocationDetailView,
      props: true,
      meta: {
        title: 'Location Details | Rick and Morty Explorer',
      },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
      meta: {
        title: 'Favorites | Rick and Morty Explorer',
      },
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareView,
      meta: {
        title: 'Compare | Rick and Morty Explorer',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: {
        title: 'Page Not Found | Rick and Morty Explorer',
      },
    },
  ],
})

export default router
