<script setup>
import { ref } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"

const router = useRouter()

const API_BASE_URL = "http://localhost:3000"

const email = ref("")
const password = ref("")
const loading = ref(false)
const error = ref(null)
const success = ref(null)

// petite validation basique côté frontend
const validateForm = () => {
  error.value = null
  success.value = null

  if (!email.value.trim()) {
    error.value = "L'email est requis."
    return false
  }
  if (!password.value || password.value.length < 6) {
    error.value = "Le mot de passe doit contenir au moins 6 caractères."
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  error.value = null
  success.value = null

  try {
    await axios.post(`${API_BASE_URL}/auth/register`, {
      email: email.value.trim(),
      password: password.value,
    })

    success.value = "Compte créé avec succès. Vous pouvez maintenant vous connecter."
    password.value = ""
  } catch (err) {
    console.error(err)

    if (err.response?.status === 409) {
      error.value = "Un compte existe déjà avec cet email."
    } else if (err.response?.status === 400) {
      error.value = "Données invalides. Vérifiez l'email et le mot de passe."
    } else {
      error.value = "Erreur lors de l'inscription. Veuillez réessayer."
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push({ name: "login" })
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>Inscription</h1>
        <p class="register-subtitle">Créez votre compte SeenFlix</p>
      </div>

      <form class="register-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            required
            minlength="6"
          />
          <small class="hint">Au moins 6 caractères</small>
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
          <span v-if="loading">Création du compte...</span>
          <span v-else>Créer mon compte</span>
        </button>

        <p v-if="error" class="error">{{ error }}</p>
        <div v-if="success" class="success-container">
          <p class="success">{{ success }}</p>
          <button class="btn-login" @click="goToLogin">
            Se connecter maintenant
          </button>
        </div>
      </form>

      <div class="register-footer">
        <p>Déjà un compte ?</p>
        <router-link to="/login" class="link-login">
          Se connecter
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: calc(100vh - var(--navbar-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.register-container {
  width: 100%;
  max-width: 440px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xxl) var(--spacing-xl);
  box-shadow: var(--shadow-md);
  animation: fadeIn var(--transition-base) ease-out;
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.register-header h1 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.register-subtitle {
  color: var(--color-text-light);
  font-size: var(--font-size-base);
}

.register-form {
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

.hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-lighter);
  margin-top: calc(-1 * var(--spacing-xs));
}

.btn-submit {
  margin-top: var(--spacing-sm);
  width: 100%;
}

.success-container {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-primary-lighter);
  border-radius: var(--radius-md);
  text-align: center;
}

.success-container .success {
  margin: 0 0 var(--spacing-md) 0;
  padding: 0;
  background: none;
  border: none;
}

.btn-login {
  background: var(--color-success);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  width: 100%;
}

.btn-login:hover {
  background: var(--color-success-light);
  transform: translateY(-1px);
}

.register-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-primary-lighter);
}

.register-footer p {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.link-login {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.link-login:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .register-container {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
}
</style>
