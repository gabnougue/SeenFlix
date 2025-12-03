<script setup>
import { ref, onMounted } from "vue"
import api from "../api/axios"
import { useUserStore } from "../store/user"

const userStore = useUserStore()

const query = ref("")
const results = ref([])
const loading = ref(false)
const error = ref(null)

// tmdbId des films déjà en favoris
const favoritesTmdbIds = ref(new Set())

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
    return
  }

  loading.value = true
  results.value = []

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
    alert("Vous devez être connecté pour ajouter un favori.")
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

    alert(`✔ "${movie.title}" ajouté à vos favoris.`)
  } catch (err) {
    console.error(err)

    if (err.response?.status === 409) {
      // Déjà en favoris côté backend → on le marque aussi côté frontend
      favoritesTmdbIds.value.add(movie.tmdbId)
      alert("⚠ Ce film est déjà dans vos favoris.")
    } else if (err.response?.status === 401) {
      alert("Session expirée, veuillez vous reconnecter.")
      userStore.logout()
    } else {
      alert("Erreur lors de l'ajout aux favoris.")
    }
  }
}

// Charger les favoris au montage de la page
onMounted(() => {
  loadFavorites()
})
</script>


<template>
  <div class="search-page">
    <h1>Recherche TMDB</h1>

    <form class="search-form" @submit.prevent="handleSearch">
      <input
        v-model="query"
        type="text"
        placeholder="Rechercher un film ou une série..."
      />
      <button type="submit" :disabled="loading">
        <span v-if="loading">Recherche...</span>
        <span v-else>Rechercher</span>
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="!loading && !error && results.length === 0 && query">
      Aucun résultat pour "{{ query }}".
    </p>

    <div v-if="results.length" class="results-grid">
      <article v-for="item in results" :key="item.tmdbId" class="result-card">
        <img
          v-if="item.posterPath"
          :src="`https://image.tmdb.org/t/p/w200${item.posterPath}`"
          :alt="item.title"
        />
        <div class="result-body">
          <h2>{{ item.title }}</h2>

          <p class="meta">
            <span>{{ item.mediaType === "tv" ? "Série" : "Film" }}</span>
            <span v-if="item.releaseDate"> • {{ item.releaseDate }}</span>
          </p>

          <p class="overview">
            {{ item.overview || "Pas de résumé disponible." }}
          </p>

          <button
            class="fav-btn"
            :class="{ added: favoritesTmdbIds.has(item.tmdbId) }"
            :disabled="favoritesTmdbIds.has(item.tmdbId)"
            @click="addToFavorites(item)">
            <span v-if="favoritesTmdbIds.has(item.tmdbId)">✔ Ajouté</span>
            <span v-else>Ajouter aux favoris</span>
          </button>


        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.search-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-form input {
  flex: 1;
  padding: 0.5rem 0.75rem;
}

.search-form button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.error {
  color: red;
  margin-bottom: 1rem;
}

.results-grid {
  display: grid;
  gap: 1rem;
}

.result-card {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.result-card img {
  width: 120px;
  border-radius: 0.5rem;
  object-fit: cover;
}

.result-body {
  flex: 1;
}

.meta {
  font-size: 0.9rem;
  color: #555;
}

.overview {
  font-size: 0.9rem;
  margin: 0.5rem 0 0.75rem;
}

.fav-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.fav-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background: #ddd;
  transition: 0.2s;
}

.fav-btn:hover {
  background: #ccc;
}

.fav-btn.added {
  background: #4caf50 !important; /* vert */
  color: white;
  cursor: default;
}

.fav-btn:disabled {
  opacity: 0.8;
  cursor: default;
}
</style>
