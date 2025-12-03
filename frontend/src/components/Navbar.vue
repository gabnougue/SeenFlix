<template>
  <nav class="navbar">
    <router-link to="/">Accueil</router-link>
    <router-link to="/search">Recherche</router-link>
    <router-link v-if="isAuthenticated" to="/favorites">Mes favoris</router-link>

    <router-link v-if="!isAuthenticated" to="/login">Connexion</router-link>
    <router-link v-if="!isAuthenticated" to="/register">Inscription</router-link>

    <button v-if="isAuthenticated" @click="handleLogout">Se déconnecter</button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const isAuthenticated = computed(() => userStore.isAuthenticated)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')  // redirection automatique
}

</script>

<style scoped>
.navbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #111;
}

a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}
</style>
