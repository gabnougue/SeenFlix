<script setup>
import { ref, onMounted } from "vue"
import api from "../api/axios"
import { useUserStore } from "../store/user"
import StarRating from "../components/StarRating.vue"

const userStore = useUserStore()

const query = ref("")
const results = ref([])
const loading = ref(false)
const error = ref(null)
const hasSearched = ref(false) // Pour savoir si une recherche a été lancée

// Films tendance
const trendingMovies = ref([])
const loadingTrending = ref(true)

// Notification système élégante
const notification = ref({
  show: false,
  message: "",
  type: "success", // success, error, warning
})

// tmdbId des films déjà en favoris
const favoritesTmdbIds = ref(new Set())

// Synopsis étendus (Set des tmdbId)
const expandedSynopsis = ref(new Set())

// Basculer l'état du synopsis
const toggleSynopsis = (tmdbId) => {
  if (expandedSynopsis.value.has(tmdbId)) {
    expandedSynopsis.value.delete(tmdbId)
  } else {
    expandedSynopsis.value.add(tmdbId)
  }
  // Force la réactivité
  expandedSynopsis.value = new Set(expandedSynopsis.value)
}

// Afficher une notification
const showNotification = (message, type = "success") => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Charger les favoris depuis le backend
const loadFavorites = async () => {
  // Si pas connecté → pas de favoris à charger
  if (!userStore.isAuthenticated) {
    favoritesTmdbIds.value = new Set()
    return
  }

  try {
    const res = await api.get("/me/favorites")
    const ids = res.data.map((fav) => fav.tmdbId)
    favoritesTmdbIds.value = new Set(ids)
  } catch (err) {
    console.warn("Impossible de charger les favoris", err)
  }
}

// Appelé au submit du formulaire
const handleSearch = async () => {
  error.value = null

  const q = query.value.trim()
  if (!q) {
    error.value = "Veuillez saisir un terme de recherche."
    results.value = []
    hasSearched.value = false
    return
  }

  loading.value = true
  results.value = []
  hasSearched.value = true // Marquer qu'une recherche a été lancée

  try {
    const response = await api.get("/movies/search", {
      params: { q },
    })

    results.value = response.data.results || []
  } catch (err) {
    console.error(err)
    error.value = "Erreur lors de la recherche, veuillez réessayer."
  } finally {
    loading.value = false
  }
}

// Ajouter un film aux favoris
const addToFavorites = async (movie) => {
  if (!userStore.isAuthenticated) {
    showNotification("Vous devez être connecté pour ajouter un favori", "warning")
    return
  }

  // Si déjà dans les favoris → ne rien faire
  if (favoritesTmdbIds.value.has(movie.tmdbId)) {
    return
  }

  try {
    await api.post("/me/favorites", {
      tmdbId: movie.tmdbId,
      type: movie.mediaType,
    })

    // On marque ce film comme favori côté frontend
    favoritesTmdbIds.value.add(movie.tmdbId)

    showNotification(`"${movie.title}" ajouté à vos favoris`, "success")
  } catch (err) {
    console.error(err)

    if (err.response?.status === 409) {
      // Déjà en favoris côté backend → on le marque aussi côté frontend
      favoritesTmdbIds.value.add(movie.tmdbId)
      showNotification("Ce film est déjà dans vos favoris", "warning")
    } else if (err.response?.status === 401) {
      showNotification("Session expirée, veuillez vous reconnecter", "error")
      userStore.logout()
    } else {
      showNotification("Erreur lors de l'ajout aux favoris", "error")
    }
  }
}

// Charger les films tendance
const loadTrendingMovies = async () => {
  loadingTrending.value = true
  try {
    const response = await api.get("/movies/trending")
    trendingMovies.value = response.data.results || []
  } catch (err) {
    console.error("Erreur lors du chargement des films tendance", err)
  } finally {
    loadingTrending.value = false
  }
}

// Charger les favoris et les films tendance au montage de la page
onMounted(() => {
  loadFavorites()
  loadTrendingMovies()
})
</script>


<template>
  <div class="search-page">
    <!-- Notification système -->
    <Transition name="slide-fade">
      <div v-if="notification.show" class="notification" :class="`notification-${notification.type}`">
        {{ notification.message }}
      </div>
    </Transition>

    <div class="search-container">
      <h1>Recherche TMDB</h1>
      <p class="search-subtitle">Découvrez des milliers de films et séries</p>

      <form class="search-form" @submit.prevent="handleSearch">
        <div class="search-input-group">
          <input
            v-model="query"
            type="text"
            placeholder="Rechercher un film ou une série..."
            class="search-input"
          />
          <button type="submit" :disabled="loading" class="btn-search">
            <span v-if="loading">Recherche...</span>
            <span v-else>Rechercher</span>
          </button>
        </div>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="!loading && !error && results.length === 0 && hasSearched" class="no-results">
        <p>Aucun résultat pour "{{ query }}"</p>
      </div>

      <!-- Films tendance (affichés uniquement si aucun résultat de recherche) -->
      <div v-if="results.length === 0 && !loading && trendingMovies.length > 0" class="trending-section">
        <h2 class="section-title">Films du moment</h2>
        <div class="results-grid">
          <article
            v-for="item in trendingMovies"
            :key="item.tmdbId"
            class="movie-card"
          >
            <div class="movie-poster">
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

            <div class="movie-content">
              <h2 class="movie-title">{{ item.title }}</h2>

              <div class="movie-meta">
                <span class="movie-type">
                  {{ item.mediaType === "tv" ? "Série" : "Film" }}
                </span>
                <span v-if="item.releaseDate" class="movie-year">
                  {{ item.releaseDate }}
                </span>
              </div>

              <!-- Note TMDB -->
              <div v-if="item.voteAverage > 0" class="tmdb-rating">
                <span class="rating-label">Note TMDB</span>
                <StarRating :modelValue="item.voteAverage" :max="10" :showValue="true" />
              </div>

              <div class="movie-overview-container">
                <p
                  class="movie-overview"
                  :class="{ 'expanded': expandedSynopsis.has(item.tmdbId) }"
                >
                  {{ item.overview || "Pas de résumé disponible." }}
                </p>
                <button
                  v-if="item.overview && item.overview.length > 150"
                  class="btn-read-more"
                  @click="toggleSynopsis(item.tmdbId)"
                >
                  {{ expandedSynopsis.has(item.tmdbId) ? 'Lire moins' : 'Lire plus' }}
                </button>
              </div>

              <button
                class="btn-favorite"
                :class="{ 'btn-favorite-added': favoritesTmdbIds.has(item.tmdbId) }"
                :disabled="favoritesTmdbIds.has(item.tmdbId)"
                @click="addToFavorites(item)"
              >
                <span v-if="favoritesTmdbIds.has(item.tmdbId)">
                  ✓ Ajouté aux favoris
                </span>
                <span v-else>+ Ajouter aux favoris</span>
              </button>
            </div>
          </article>
        </div>
      </div>

      <!-- Résultats de recherche -->
      <div v-if="results.length" class="results-grid">
        <article
          v-for="item in results"
          :key="item.tmdbId"
          class="movie-card"
        >
          <div class="movie-poster">
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

          <div class="movie-content">
            <h2 class="movie-title">{{ item.title }}</h2>

            <div class="movie-meta">
              <span class="movie-type">
                {{ item.mediaType === "tv" ? "Série" : "Film" }}
              </span>
              <span v-if="item.releaseDate" class="movie-year">
                {{ item.releaseDate }}
              </span>
            </div>

            <!-- Note TMDB -->
            <div v-if="item.voteAverage > 0" class="tmdb-rating">
              <span class="rating-label">Note TMDB</span>
              <StarRating :modelValue="item.voteAverage" :max="10" :showValue="true" />
            </div>

            <div class="movie-overview-container">
              <p
                class="movie-overview"
                :class="{ 'expanded': expandedSynopsis.has(item.tmdbId) }"
              >
                {{ item.overview || "Pas de résumé disponible." }}
              </p>
              <button
                v-if="item.overview && item.overview.length > 150"
                class="btn-read-more"
                @click="toggleSynopsis(item.tmdbId)"
              >
                {{ expandedSynopsis.has(item.tmdbId) ? 'Lire moins' : 'Lire plus' }}
              </button>
            </div>

            <button
              class="btn-favorite"
              :class="{ 'btn-favorite-added': favoritesTmdbIds.has(item.tmdbId) }"
              :disabled="favoritesTmdbIds.has(item.tmdbId)"
              @click="addToFavorites(item)"
            >
              <span v-if="favoritesTmdbIds.has(item.tmdbId)">
                ✓ Ajouté aux favoris
              </span>
              <span v-else>+ Ajouter aux favoris</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  min-height: calc(100vh - var(--navbar-height));
  padding: var(--spacing-xl) var(--spacing-lg);
  position: relative;
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

.notification-warning {
  background: #ff9800;
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
.search-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.search-container h1 {
  text-align: left;
  color: var(--color-primary);
}

/* Section trending */
.trending-section {
  animation: fadeIn var(--transition-base) ease-out;
}

.section-title {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  font-weight: 600;
}

.search-subtitle {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-base);
}

/* Formulaire de recherche */
.search-form {
  margin-bottom: var(--spacing-xl);
}

.search-input-group {
  display: flex;
  gap: var(--spacing-sm);
  max-width: 700px;
}

.search-input {
  flex: 1;
  font-size: var(--font-size-lg);
  padding: var(--spacing-md) var(--spacing-lg);
}

.btn-search {
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-md) var(--spacing-xl);
  white-space: nowrap;
}

.btn-search:hover:not(:disabled) {
  color: var(--color-primary-dark);
}

/* Messages */
.no-results {
  text-align: center;
  padding: var(--spacing-xxl);
  color: var(--color-text-light);
}

/* Grille de résultats */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
}

/* Card de film */
.movie-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.movie-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
}

.movie-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: var(--color-primary-lighter);
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.movie-card:hover .movie-poster img {
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

.movie-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.movie-title {
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  line-height: 1.3;
}

.movie-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.movie-type {
  background: var(--color-primary-lighter);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.movie-year {
  padding: var(--spacing-xs) 0;
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

.movie-overview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.movie-overview {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all var(--transition-base);
}

.movie-overview.expanded {
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

/* Bouton favoris */
.btn-favorite {
  width: 100%;
  margin-top: 10px;
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all var(--transition-base);
}

.btn-favorite:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-favorite-added {
  background: var(--color-success) !important;
  cursor: default !important;
}

.btn-favorite-added:hover {
  transform: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .search-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .notification {
    right: var(--spacing-md);
    left: var(--spacing-md);
    max-width: none;
  }

  .search-input-group {
    flex-direction: column;
  }

  .results-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>
