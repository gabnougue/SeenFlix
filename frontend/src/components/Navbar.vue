<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo et branding -->
      <router-link to="/" class="navbar-brand">
        <img src="/logo.png" alt="SeenFlix" class="navbar-logo" />
        <span class="navbar-title">SeenFlix</span>
      </router-link>

      <!-- Navigation links -->
      <div class="navbar-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/search" class="nav-link">Recherche</router-link>
        <router-link v-if="isAuthenticated" to="/favorites" class="nav-link">
          Mes Favoris
        </router-link>
      </div>

      <!-- Auth buttons -->
      <div class="navbar-auth">
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="nav-link">Connexion</router-link>
          <router-link to="/register" class="btn-nav-register">Inscription</router-link>
        </template>
        <button v-else @click="handleLogout" class="btn-nav-logout">
          Déconnexion
        </button>
      </div>
    </div>
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
  background: #cbb6ee;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--navbar-height);
  border-bottom: 1px solid var(--color-primary-lighter);
}

.navbar-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  gap: var(--spacing-lg);
}

/* Logo et branding */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.navbar-brand:hover {
  transform: scale(1.02);
}

.navbar-logo {
  height: 40px;
  width: auto;
}

.navbar-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

/* Navigation links */
.navbar-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  justify-content: center;
}

.nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-base);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-lighter);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  background: var(--color-primary-lighter);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
}

/* Auth buttons */
.navbar-auth {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.btn-nav-register {
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
}

.btn-nav-register:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-nav-logout {
  background: transparent;
  color: var(--color-error);
  border: 2px solid var(--color-error-light);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-nav-logout:hover {
  background: var(--color-error);
  color: var(--color-white);
  border-color: var(--color-error);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .navbar-title {
    display: none;
  }

  .navbar-links {
    gap: var(--spacing-sm);
  }

  .nav-link {
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .btn-nav-register,
  .btn-nav-logout {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
}
</style>
