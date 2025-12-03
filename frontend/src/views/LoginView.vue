<template>
  <div class="login-page">
    <h1>Connexion</h1>
    <form @submit.prevent="onSubmit" class="login-form">
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>
      <label>
        Mot de passe
        <input v-model="password" type="password" required minlength="6" />
      </label>

      <button :disabled="loading" type="submit">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
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
    router.push('/dashboard') // dashboard à faire ou changer la page d'accès après login
  }

  loading.value = false
}

</script>

<style scoped>
/* style minimal */
.login-page { max-width: 420px; margin: 2rem auto; padding: 1rem; }
.error { color: #c00; margin-top: .5rem; }
</style>
