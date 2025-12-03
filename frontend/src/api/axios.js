import axios from "axios"
import { useUserStore } from "../store/user"

const api = axios.create({
  baseURL: "http://localhost:3000",
})

// ajoute automatiquement Authorization: Bearer token
api.interceptors.request.use((config) => {
  const userStore = useUserStore()

  if (userStore.accessToken) {
    config.headers.Authorization = `Bearer ${userStore.accessToken}`
  }

  return config
})

// Gère les erreurs 401 et tente de rafraîchir le token
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si c'est une 401 et qu'on n'a pas déjà essayé de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Éviter de rafraîchir sur les routes auth/login, auth/register, auth/refresh
      if (
        originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/register') ||
        originalRequest.url.includes('/auth/refresh')
      ) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const userStore = useUserStore()

      try {
        const refreshed = await userStore.tryRefresh()
        if (refreshed) {
          processQueue(null, userStore.accessToken)
          originalRequest.headers.Authorization = `Bearer ${userStore.accessToken}`
          return api(originalRequest)
        } else {
          processQueue(error, null)
          return Promise.reject(error)
        }
      } catch (err) {
        processQueue(err, null)
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
