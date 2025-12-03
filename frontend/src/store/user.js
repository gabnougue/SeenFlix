import { defineStore } from "pinia"
import api from "../api/axios"

const LS_KEY = "seenflix_auth" // clé dans localStorage

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isLoggedIn: (state) => !!state.user,
    getUserEmail: (state) => state.user?.email ?? null,
  },

  actions: {
    saveToStorage() {
      const payload = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        user: this.user,
      }
      localStorage.setItem(LS_KEY, JSON.stringify(payload))
    },

    loadFromStorage() {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return false
      try {
        const { accessToken, refreshToken, user } = JSON.parse(raw)
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        this.user = user
        return true
      } catch (e) {
        console.warn("loadFromStorage: invalid JSON", e)
        return false
      }
    },

    clearStorage() {
      localStorage.removeItem(LS_KEY)
    },

    async login(email, password) {
      try {
        this.error = null
        const res = await api.post("/auth/login", { email, password })
        // ⚠️ adapter à la réponse réelle du backend
        const { accessToken, refreshToken, user } = res.data

        this.accessToken = accessToken
        this.refreshToken = refreshToken ?? null
        this.user = user

        this.saveToStorage()
        return { success: true }
      } catch (err) {
        if (err.response) {
          if (err.response.status === 400) {
            this.error = "Email ou mot de passe manquant ou invalide."
          } else if (err.response.status === 401) {
            this.error = "Email ou mot de passe incorrect."
          } else {
            this.error = "Une erreur est survenue, réessayez plus tard."
          }
        } else {
          this.error = "Impossible de joindre le serveur."
        }
        return { success: false }
      }
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.clearStorage()
    },

    async tryRefresh() {
      if (!this.refreshToken) return false
      try {
        const response = await api.post("/auth/refresh", {
          refreshToken: this.refreshToken,
        })
        this.accessToken = response.data.accessToken
        this.refreshToken = response.data.refreshToken || this.refreshToken
        this.saveToStorage()
        return true
      } catch (err) {
        this.logout()
        return false
      }
    },

    async restoreSession() {
      const ok = this.loadFromStorage()
      if (!ok || !this.accessToken) {
        this.user = null
        return
      }

      try {
        // ⚠️ adapter l’URL à ton backend réel : /me ou /auth/me
        const response = await api.get("/me", {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        })
        this.user = response.data.user ?? response.data
        this.saveToStorage()
      } catch (err) {
        if (err?.response?.status === 401) {
          const refreshed = await this.tryRefresh()
          if (!refreshed) this.logout()
        } else {
          console.warn("restoreSession: could not call /me", err)
        }
      }
    },

    async addFavorite(movie) {
        try {
            await api.post("/me/favorites", {
            tmdbId: movie.tmdbId,
            type: movie.mediaType,
            rating: 0,
            comment: null,
            })
            return { success: true }
        } catch (err) {
            return { success: false, error: err.response?.data || err.message }
        }
    }
  },
})
