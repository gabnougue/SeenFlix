import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,     // email + id du backend
    token: null     // JWT stocké ici
  }),
  actions: {
    setUser(user, token) {
      this.user = user
      this.token = token
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('jwt')
    }
  }
})
