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
    },
    {
      path: '/characters',
      name: 'characters',
      component: CharactersView,
    },
    {
      path: '/episodes',
      name: 'episodes',
      component: EpisodesView,
    },
    {
      path: '/locations',
      name: 'locations',
      component: LocationsView,
    },
    {
      path: '/character/:id',
      name: 'character-detail',
      component: CharacterDetailView,
      props: true,
    },
    {
      path: '/episode/:id',
      name: 'episode-detail',
      component: EpisodeDetailView,
      props: true,
    },
    {
      path: '/location/:id',
      name: 'location-detail',
      component: LocationDetailView,
      props: true,
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
    },
    {
      path: '/compare',
      name: 'compare',
      component: CompareView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

export default router
