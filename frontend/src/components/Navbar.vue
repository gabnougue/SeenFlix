<template>
  <nav class="navbar">
    <router-link to="/">Accueil</router-link>
    <router-link to="/login">Connexion</router-link>
    <router-link to="/register">Inscription</router-link>
  </nav>
</template>

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
