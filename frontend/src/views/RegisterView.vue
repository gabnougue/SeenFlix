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
    <h1>Inscription</h1>

    <form class="register-form" @submit.prevent="handleSubmit">
      <label>
        Email
        <input
          v-model="email"
          type="email"
          placeholder="vous@example.com"
          autocomplete="email"
        />
      </label>

      <label>
        Mot de passe
        <input
          v-model="password"
          type="password"
          placeholder="Votre mot de passe"
          autocomplete="new-password"
        />
      </label>

      <button type="submit" :disabled="loading">
        <span v-if="loading">Création du compte...</span>
        <span v-else>S'inscrire</span>
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">
      {{ success }}
      <button class="link-button" @click="goToLogin">
        Se connecter
      </button>
    </p>
  </div>
</template>

<style scoped>
.register-page {
  max-width: 400px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.register-form label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}

.register-form input {
  margin-top: 0.25rem;
  padding: 0.5rem 0.75rem;
}

.register-form button {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.error {
  color: #b00020;
}

.success {
  color: #0b7a3b;
}

.link-button {
  margin-left: 0.5rem;
  border: none;
  background: none;
  color: #0b5ed7;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-size: 0.9rem;
}
</style>
