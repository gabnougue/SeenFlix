<template>
  <div class="home">
    <div class="home-hero">
      <img src="/logo.png" alt="SeenFlix" class="home-logo" />
      <h1 class="home-title">SeenFlix</h1>
      <p class="home-tagline">
        Recherchez vos films et séries préférés,<br />
        et gardez vos favoris au même endroit.
      </p>

      <div class="home-actions">
        <router-link class="btn-primary btn-hero" to="/search">
          Rechercher des films
        </router-link>
      </div>
    </div>

    <div class="home-features">
      <div class="feature-card">
        <img src="/search.png" alt="Recherche" class="feature-icon-img" />
        <h3>Recherche TMDB</h3>
        <p>Accédez à la plus grande base de données de films et séries</p>
      </div>
      <div class="feature-card">
        <img src="/fav.png" alt="Favoris" class="feature-icon-img" />
        <h3>Mes Favoris</h3>
        <p>Sauvegardez vos films préférés et retrouvez-les facilement</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: calc(100vh - var(--navbar-height));
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Hero section */
.home-hero {
  text-align: center;
  padding: var(--spacing-xxl) var(--spacing-lg);
  max-width: 700px;
  animation: fadeIn var(--transition-slow) ease-out;
}

.home-logo {
  width: 120px;
  height: auto;
  margin-bottom: var(--spacing-lg);
  animation: fadeIn 0.6s ease-out;
  filter: drop-shadow(0 4px 12px rgba(136, 77, 167, 0.2));
}

.home-title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-md);
  letter-spacing: -1px;
}

.home-tagline {
  font-size: var(--font-size-lg);
  color: var(--color-text-light);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
}

.home-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-hero {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  text-decoration: none;
}

.btn-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(136, 77, 167, 0.3);
}

/* Features section */
.home-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
  padding: var(--spacing-xl) var(--spacing-lg);
  max-width: 800px;
  width: 100%;
  margin-top: var(--spacing-xl);
}

.feature-card {
  background: var(--bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--color-primary-light);
}

.feature-icon-img {
  width: 80px;
  height: 80px;
  margin-bottom: var(--spacing-md);
  object-fit: contain;
}

.feature-card h3 {
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.feature-card p {
  color: var(--color-text-light);
  font-size: var(--font-size-base);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .home-hero {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .home-logo {
    width: 100px;
  }

  .home-features {
    grid-template-columns: 1fr;
    padding: var(--spacing-lg) var(--spacing-md);
  }
}
</style>
