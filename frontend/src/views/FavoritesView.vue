<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import api from "../api/axios"
import { useUserStore } from "../store/user"
import StarRating from "../components/StarRating.vue"
import FavoriteEditor from "../components/FavoriteEditor.vue"

const userStore = useUserStore()
const router = useRouter()

const favorites = ref([])
const loading = ref(true)
const error = ref(null)
const itemToRemove = ref(null)

// Synopsis étendus (Set des id)
const expandedSynopsis = ref(new Set())

// Basculer l'état du synopsis
const toggleSynopsis = (id) => {
  if (expandedSynopsis.value.has(id)) {
    expandedSynopsis.value.delete(id)
  } else {
    expandedSynopsis.value.add(id)
  }
  // Force la réactivité
  expandedSynopsis.value = new Set(expandedSynopsis.value)
}

// Notification système
const notification = ref({
  show: false,
  message: "",
  type: "success",
})

const showNotification = (message, type = "success") => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

/**
 * Récupère les favoris depuis le backend (déjà enrichis avec TMDB)
 */
const loadFavorites = async () => {
  // Vérifier si l'utilisateur est connecté
  if (!userStore.isAuthenticated) {
    router.push("/login")
    return
  }

  loading.value = true
  error.value = null

  try {
    // Le backend enrichit automatiquement avec les données TMDB
    const res = await api.get("/me/favorites")
    favorites.value = res.data
  } catch (err) {
    console.error(err)
    // Si l'erreur est une 401, rediriger vers login
    if (err.response?.status === 401) {
      router.push("/login")
    } else {
      error.value = "Impossible de charger vos favoris."
    }
  } finally {
    loading.value = false
  }
}

const removeFavorite = async (id) => {
  // Marquer l'élément pour animation
  itemToRemove.value = id

  // Attendre la fin de l'animation
  setTimeout(async () => {
    try {
      await api.delete(`/me/favorites/${id}`)
      favorites.value = favorites.value.filter((f) => f.id !== id)
      showNotification("Favori retiré avec succès", "success")
    } catch (err) {
      console.error(err)
      showNotification("Erreur lors de la suppression", "error")
      itemToRemove.value = null // Annuler l'animation en cas d'erreur
    }
  }, 300)
}

// Mettre à jour un favori (rating/comment)
const updateFavorite = async ({ favoriteId, data }) => {
  try {
    const response = await api.patch(`/me/favorites/${favoriteId}`, data)

    // Mettre à jour localement
    const index = favorites.value.findIndex(f => f.id === favoriteId)
    if (index !== -1) {
      favorites.value[index] = { ...favorites.value[index], ...response.data }
    }

    showNotification("Modifications enregistrées", "success")
  } catch (err) {
    console.error(err)
    showNotification("Erreur lors de la sauvegarde", "error")
  }
}

onMounted(loadFavorites)
</script>

<template>
  <div class="favorites-page">
    <Transition name="slide-fade">
      <div v-if="notification.show" class="notification" :class="`notification-${notification.type}`">
        {{ notification.message }}
      </div>
    </Transition>

    <div class="favorites-container">
      <h1>Mes Favoris</h1>
      <p class="favorites-subtitle">Retrouvez tous vos films et séries préférés</p>

      <div v-if="loading" class="loading-state">
        <p>Chargement de vos favoris...</p>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="!loading && favorites.length === 0" class="empty-state">
        <div class="empty-icon">⭐</div>
        <p class="empty-message">Aucun favori pour le moment</p>
        <p class="empty-hint">Ajoutez des films depuis la recherche pour les retrouver ici</p>
        <router-link to="/search" class="btn-primary">
          Découvrir des films
        </router-link>
      </div>

      <TransitionGroup name="list" tag="div" v-if="favorites.length" class="favorites-grid">
        <article
          v-for="item in favorites"
          :key="item.id"
          class="favorite-card"
          :class="{ 'removing': itemToRemove === item.id }"
        >
          <router-link :to="{ name: 'movie-detail', params: { type: item.type, id: item.tmdbId }}" class="poster-link">
            <div class="favorite-poster">
              <img
                v-if="item.posterPath"
                :src="`https://image.tmdb.org/t/p/w300${item.posterPath}`"
                :alt="item.title"
                loading="lazy"
              />
              <div v-else class="poster-placeholder">
                <span>Pas d'image</span>
              </div>
            </div>
          </router-link>

          <div class="favorite-content">
            <router-link :to="{ name: 'movie-detail', params: { type: item.type, id: item.tmdbId }}" class="link-no-style">
              <h2 class="favorite-title hover-link">{{ item.title }}</h2>
            </router-link>

            <div class="favorite-meta">
              <span class="favorite-type">
                {{ item.type === "tv" ? "Série" : "Film" }}
              </span>
            </div>

            <div v-if="item.voteAverage > 0" class="tmdb-rating">
              <span class="rating-label">Note TMDB</span>
              <StarRating :modelValue="item.voteAverage" :max="10" :showValue="true" />
            </div>

            <div class="favorite-overview-container">
              <p
                class="favorite-overview"
                :class="{ 'expanded': expandedSynopsis.has(item.id) }"
              >
                {{ item.overview || "Pas de résumé disponible." }}
              </p>
              <button
                v-if="item.overview && item.overview.length > 150"
                class="btn-read-more"
                @click="toggleSynopsis(item.id)"
              >
                {{ expandedSynopsis.has(item.id) ? 'Lire moins' : 'Lire plus' }}
              </button>
            </div>

            <FavoriteEditor
              :favoriteId="item.id"
              :initialRating="item.rating || 0"
              :initialComment="item.comment || ''"
              @update="updateFavorite"
            />

            <button class="btn-remove" @click="removeFavorite(item.id)">
              Retirer des favoris
            </button>
          </div>
        </article>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: calc(100vh - var(--navbar-height));
  padding: var(--spacing-xl) var(--spacing-lg);
  position: relative;
}

/* Lien pour le titre et l'image */
.link-no-style {
  text-decoration: none;
  color: inherit;
  display: block;
}

.hover-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.poster-link {
  display: block;
  width: 100%;
  height: 100%; /* Important pour que le lien prenne toute la hauteur du conteneur image */
}

/* Notification système */
.notification {
  position: fixed;
  top: calc(var(--navbar-height) + var(--spacing-md));
  right: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  font-weight: 500;
  max-width: 400px;
}

.notification-success {
  background: var(--color-success);
  color: var(--color-white);
}

.notification-error {
  background: var(--color-error);
  color: var(--color-white);
}

/* Transitions pour la notification */
.slide-fade-enter-active {
  animation: slideIn var(--transition-base) ease-out;
}

.slide-fade-leave-active {
  animation: slideIn var(--transition-base) ease-out reverse;
}

/* Container principal */
.favorites-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.favorites-container h1 {
  text-align: left;
  color: var(--color-primary);
}

.favorites-subtitle {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-base);
}

/* États de chargement et vide */
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-xxl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-message {
  font-size: var(--font-size-xl);
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.empty-hint {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xl);
}

/* Grille de favoris */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

/* Card de favori */
.favorite-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.favorite-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}

.favorite-card.removing {
  animation: fadeOut var(--transition-base) ease-out forwards;
}

.favorite-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: var(--color-primary-lighter);
}

.favorite-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.favorite-card:hover .favorite-poster img {
  transform: scale(1.05);
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-lighter) 0%, var(--color-primary-light) 100%);
  color: var(--color-primary);
  font-weight: 500;
}

.favorite-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.favorite-title {
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  line-height: 1.3;
}

.favorite-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.favorite-type {
  background: var(--color-primary-lighter);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

/* Note TMDB */
.tmdb-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-sm);
}

.rating-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  font-weight: 500;
}

.favorite-overview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.favorite-overview {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all var(--transition-base);
}

.favorite-overview.expanded {
  display: block;
  -webkit-line-clamp: unset;
}

.btn-read-more {
  align-self: flex-start;
  background: transparent;
  color: var(--color-primary);
  border: none;
  padding: var(--spacing-xs) 0;
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: color var(--transition-fast);
  text-decoration: underline;
}

.btn-read-more:hover {
  color: var(--color-primary-dark);
}

/* Bouton retirer */
.btn-remove {
  width: 100%;
  background: transparent;
  margin-top: 10px;
  color: var(--color-error);
  border: 2px solid var(--color-error-light);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all var(--transition-base);
}

.btn-remove:hover {
  background: var(--color-error);
  color: var(--color-white);
  border-color: var(--color-error);
  transform: translateY(-1px);
}

/* Animations de liste */
.list-enter-active,
.list-leave-active {
  transition: all var(--transition-base);
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.list-move {
  transition: transform var(--transition-base);
}

/* Responsive */
@media (max-width: 768px) {
  .favorites-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .notification {
    right: var(--spacing-md);
    left: var(--spacing-md);
    max-width: none;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>