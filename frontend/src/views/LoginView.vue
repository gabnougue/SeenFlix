<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Connexion</h1>
        <p class="login-subtitle">Accédez à vos favoris et bien plus</p>
      </div>

      <form @submit.prevent="onSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            minlength="6"
            autocomplete="current-password"
          />
        </div>

        <button :disabled="loading" type="submit" class="btn-submit">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>

      <div class="login-footer">
        <p>Pas encore de compte ?</p>
        <router-link to="/register" class="link-register">
          Créer un compte
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const email = ref('')
const password = ref('')
const error = ref(null)
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  error.value = null

  await userStore.login(email.value, password.value)

  if (userStore.error) {
    error.value = userStore.error 
  } else {
    router.push('/') // dashboard à faire ou changer la page d'accès après login
  }

  loading.value = false
}

</script>

<style scoped>
.login-page {
  min-height: calc(100vh - var(--navbar-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 440px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xxl) var(--spacing-xl);
  box-shadow: var(--shadow-md);
  animation: fadeIn var(--transition-base) ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-header h1 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  color: var(--color-text-light);
  font-size: var(--font-size-base);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: 500;
  color: var(--color-text);
}

.btn-submit {
  margin-top: var(--spacing-sm);
  width: 100%;
}

.login-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-primary-lighter);
}

.login-footer p {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.link-register {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.link-register:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
}
</style>
