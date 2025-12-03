<script setup>
import { ref } from "vue"
import { apiClient } from "../api/client"

// URL du backend SeenFlix
const API_BASE_URL = "http://localhost:3000"

const query = ref("")
const results = ref([])
const loading = ref(false)
const error = ref(null)

// TODO plus tard : regarder le store user pour savoir si connecté
// import { useUserStore } from "../store/user"
// const userStore = useUserStore()

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
   const response = await apiClient.get("/movies/search", {
    params: { q },
})


    // Le backend renvoie { query, results: [...] }
    results.value = response.data.results || []
  } catch (err) {
    console.error(err)
    error.value = "Erreur lors de la recherche, veuillez réessayer."
  } finally {
    loading.value = false
  }
}

// Bouton “Ajouter aux favoris” (sera vraiment branché à l’étape 7)
const addToFavorites = (movie) => {
  // Ici on fera plus tard un appel POST /me/favorites
  console.log("TODO add to favorites:", movie)
  alert(`(Étape 7) Ajout aux favoris : ${movie.title}`)
}
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

          <!-- Bouton favoris (vraie intégration en étape 7) -->
          <button class="fav-btn" @click="addToFavorites(item)">
            Ajouter aux favoris
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
</style>
