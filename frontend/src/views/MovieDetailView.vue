<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'
import StarRating from '../components/StarRating.vue'
import { useUserStore } from '../store/user'

const route = useRoute()
const userStore = useUserStore()

const movie = ref(null)
const loading = ref(true)
const error = ref(null)
const userFavorite = ref(null)

// Récupération des infos via notre backend
const fetchMovie = async () => {
  loading.value = true
  error.value = null
  try {
    const { type, id } = route.params
    const res = await api.get(`/movies/${type}/${id}`)
    movie.value = res.data
    
    // Vérifier si l'utilisateur a ce film dans ses favoris
    if (userStore.isAuthenticated) {
      await checkUserFavorite()
    }
  } catch (err) {
    console.error(err)
    error.value = "Impossible de charger les détails du film."
  } finally {
    loading.value = false
  }
}

// Vérifier si le film est dans les favoris de l'utilisateur
const checkUserFavorite = async () => {
  try {
    const { type, id } = route.params
    const res = await api.get('/me/favorites')
    const favorite = res.data.find(f => f.tmdbId === parseInt(id) && f.type === type)
    userFavorite.value = favorite || null
  } catch (err) {
    console.error('Erreur lors de la vérification des favoris', err)
  }
}

// Fonction pour ajouter aux favoris (raccourci depuis la page détail)
const addToFavorites = async () => {
  if (!userStore.isAuthenticated) return alert("Connectez-vous pour ajouter aux favoris")
  try {
    const { type, id } = route.params
    const res = await api.post("/me/favorites", { tmdbId: parseInt(id), type })
    // Mettre à jour l'état local au lieu de recharger
    userFavorite.value = res.data
  } catch (err) {
    if (err.response?.status === 409) {
      // Déjà dans les favoris, vérifier l'état
      await checkUserFavorite()
    } else {
      alert("Erreur lors de l'ajout")
    }
  }
}

// Fonction pour retirer des favoris
const removeFromFavorites = async () => {
  if (!userFavorite.value) return
  try {
    await api.delete(`/me/favorites/${userFavorite.value.id}`)
    // Mettre à jour l'état local directement
    userFavorite.value = null
  } catch (err) {
    alert("Erreur lors de la suppression")
  }
}

onMounted(fetchMovie)
</script>

<template>
  <div class="detail-page">
    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <div v-else-if="movie" class="movie-container">
      
      <div class="hero" :style="movie.backdropPath ? { backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdropPath})` } : {}">
        <div class="hero-overlay">
          <div class="hero-content">
            <img 
              v-if="movie.posterPath"
              :src="`https://image.tmdb.org/t/p/w500${movie.posterPath}`" 
              class="poster" 
              alt="Poster"
            />
            <div class="infos">
              <h1 class="title">{{ movie.title }}</h1>
              <p class="subtitle">{{ movie.originalTitle }} • {{ movie.releaseDate?.split('-')[0] }}</p>
              
              <div class="genres">
                <span v-for="g in movie.genres" :key="g.id" class="tag">{{ g.name }}</span>
              </div>

              <div class="ratings-row">
                <div class="rating-box tmdb">
                  <span class="label">TMDB</span>
                  <StarRating :modelValue="movie.voteAverageTmdb" :max="10" :showValue="true" />
                </div>
                <div class="rating-box seenflix">
                  <span class="label">Note SeenFlix</span>
                  <StarRating :modelValue="movie.seenFlixRating" :max="5" :showValue="true" />
                  <span class="count">({{ movie.reviews.length }} avis)</span>
                </div>
              </div>

              <div class="actions">
                <Transition name="fade" mode="out-in">
                  <button 
                    v-if="!userFavorite" 
                    key="add"
                    class="btn-primary" 
                    @click="addToFavorites"
                  >
                    + Ajouter à mes favoris / Noter
                  </button>
                  <button 
                    v-else 
                    key="remove"
                    class="btn-secondary" 
                    @click="removeFromFavorites"
                  >
                    ✓ Dans mes favoris - Retirer
                  </button>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-content">
        <div class="synopsis-box">
          <h2>Synopsis</h2>
          <p class="overview">{{ movie.overview || "Aucun résumé disponible." }}</p>
        </div>
      </div>

      <div class="section-content reviews-section">
        <h2>Avis de la communauté</h2>
        
        <div v-if="movie.reviews.length === 0" class="no-reviews">
          <p>Aucun avis pour le moment. Soyez le premier à le noter !</p>
        </div>

        <div v-else class="reviews-list">
          <div v-for="review in movie.reviews" :key="review.id" class="review-card">
            <div class="review-header">
              <span class="username">{{ review.user }}</span>
              <span class="date">{{ new Date(review.date).toLocaleDateString() }}</span>
            </div>
            <div class="review-rating" v-if="review.rating > 0">
              <StarRating :modelValue="review.rating" :max="5" />
            </div>
            <p class="comment" v-if="review.comment">"{{ review.comment }}"</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: calc(100vh - var(--navbar-height));
  background: var(--bg-primary);
}

/* HERO */
.hero {
  background-size: cover;
  background-position: center;
  position: relative;
  color: white;
}
.hero-overlay {
  background: linear-gradient(to bottom, rgba(44, 44, 44, 0.8), var(--bg-primary));
  padding: var(--spacing-xxl) var(--spacing-lg);
}
.hero-content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  gap: var(--spacing-xl);
  align-items: flex-end;
}
.poster {
  width: 250px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}
.infos {
  flex: 1;
}
.title {
  font-size: 3rem;
  margin-bottom: var(--spacing-xs);
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.8;
  margin-bottom: var(--spacing-md);
}
.genres {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}
.tag {
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  backdrop-filter: blur(4px);
}

/* RATINGS */
.ratings-row {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  background: rgba(0,0,0,0.3);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  backdrop-filter: blur(4px);
  width: fit-content;
}
.rating-box {
  display: flex;
  flex-direction: column;
}
.rating-box .label {
  font-size: var(--font-size-xs);
  opacity: 0.7;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.rating-box .count {
  font-size: var(--font-size-xs);
  opacity: 0.6;
}

/* CONTENT */
.section-content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

/* SYNOPSIS BOX */
.synopsis-box {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05), rgba(220, 38, 38, 0.02));
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  max-width: 900px;
}

.synopsis-box::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 20px;
  font-size: 120px;
  color: rgba(220, 38, 38, 0.08);
  font-family: Georgia, serif;
  line-height: 1;
}

.synopsis-box h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
  font-size: 1.5rem;
  position: relative;
  z-index: 1;
}

.overview {
  font-size: var(--font-size-lg);
  line-height: 1.8;
  color: var(--color-text);
  position: relative;
  z-index: 1;
  margin: 0;
}

/* REVIEWS */
.reviews-grid {
  display: grid;
  gap: var(--spacing-md);
}
.review-card {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-md);
}
.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}
.username {
  font-weight: 700;
  color: var(--color-primary);
}
.date {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}
.comment {
  margin-top: var(--spacing-sm);
  font-style: italic;
  color: var(--color-text-light);
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .poster {
    width: 180px;
  }
  .ratings-row {
    margin: var(--spacing-lg) auto;
  }
}
</style>