import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import SearchView from "../views/SearchView.vue"
import FavoritesView from "../views/FavoritesView.vue"
import { useUserStore } from "../store/user"
import MovieDetailView from '../views/MovieDetailView.vue' // Nous allons créer ce fichier


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: "/search", name: "search", component: SearchView },
    { path: "/favorites", name: "favorites", component: FavoritesView, meta: { requiresAuth: true }},
    { path: '/movie/:type/:id', name: 'movie-detail', component: MovieDetailView}
  ]
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  // On tente de restaurer la session si ce n'est pas déjà fait
  if (!userStore.user && !userStore.accessToken) {
    await userStore.restoreSession()
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return {
      name: "login",
      query: { redirect: to.fullPath }, // optionnel : pour revenir après connexion
    }
  }

  // sinon on laisse passer
  return true
})

export default router
