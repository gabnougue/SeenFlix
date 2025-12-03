<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import api from "../api/axios"
import { useUserStore } from "../store/user"

const userStore = useUserStore()
const router = useRouter()

const favorites = ref([])
const loading = ref(true)
const error = ref(null)

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
  if (!confirm("Supprimer ce favori ?")) return

  try {
    await api.delete(`/me/favorites/${id}`)
    favorites.value = favorites.value.filter((f) => f.id !== id)
  } catch (err) {
    console.error(err)
    alert("Suppression impossible")
  }
}

onMounted(loadFavorites)
</script>

<template>
  <div class="favorites-page">
    <h1>Mes Favoris</h1>

    <p v-if="loading">Chargement…</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!loading && favorites.length === 0">
      <p>Aucun favori pour le moment.</p>
    </div>

    <div v-if="favorites.length" class="favorites-grid">
      <article v-for="item in favorites" :key="item.id" class="favorite-card">
        <img
          v-if="item.posterPath"
          :src="`https://image.tmdb.org/t/p/w200${item.posterPath}`"
        />
        <div class="favorite-body">
          <h2>{{ item.title }}</h2>
          <p class="meta">
            {{ item.type === "tv" ? "Série" : "Film" }}
          </p>
          <p class="overview">{{ item.overview }}</p>

          <button class="remove-btn" @click="removeFavorite(item.id)">
            Retirer ❌
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.favorites-grid {
  display: grid;
  gap: 1rem;
}

.favorite-card {
  display: flex;
  gap: 1rem;
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.favorite-card img {
  width: 120px;
  border-radius: 8px;
}

.remove-btn {
  margin-top: 1rem;
  background: #e63946;
  padding: 0.4rem 0.8rem;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
</style>
