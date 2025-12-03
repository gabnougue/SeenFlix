<template>
  <div class="home">
    <h1>🎬 SeenFlix</h1>
    <p class="tagline">
      Recherchez vos films et séries, et gardez vos favoris au même endroit.
    </p>

    <div class="actions">
      <router-link class="btn primary" to="/search">🔍 Recherche TMDB</router-link>
      <router-link class="btn" to="/login">Connexion</router-link>
      <router-link class="btn" to="/register">Créer un compte</router-link>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 4rem 1rem;
}

.tagline {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #555;
}

.actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 250px;
  margin-inline: auto;
}

.btn {
  display: inline-block;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  background: #eee;
  color: #222;
  font-weight: 600;
}

.btn.primary {
  background: #c62828;
  color: white;
}
</style>
