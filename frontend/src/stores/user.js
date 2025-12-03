import { defineStore } from "pinia";
import api from "../axios";
const LS_KEY = 'seenflix_auth' // clé dans localStorage

export const useUserStore = defineStore("user", {
    state: () => ({
        user: null,
        accessToken: null,
        refreshToken: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        isLoggedIn: (state) => !!state.user,
        getUserEmail: (state) => state.user?.email ?? null
    },
      
    actions: {
        saveToStorage() {
            const payload = {
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                user: this.user
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
                console.warn('loadFromStorage: invalid JSON', e)
                return false
            }
          },
          clearStorage() {
            localStorage.removeItem(LS_KEY)
          },

        async login(credentials) {
            try {
                const response = await api.post('/auth/login', credentials);
                // données renvoyées par le backend
                this.accessToken = response.data.accessToken;
                this.refreshToken = response.data.refreshToken || null;
                this.user = response.data.user;
                
                this.saveToStorage();
            } catch (err) {
                console.error(err);
                throw err;
            }
        },

        logout() {
            this.user = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.clearStorage();
        },

        async tryRefresh() {
            if (!this.refreshToken) return false;
            try {
                const response = await api.post('/auth/refresh', {
                    refreshToken: this.refreshToken
                });
                this.accessToken = response.data.accessToken;
                this.refreshToken = response.data.refreshToken || this.refreshToken;

                this.saveToStorage();
                return true;
            } catch (err) {
                this.logout();
                return false;
            }
        },        

        async restoreSession() {
            const token = this.loadFromStorage();
            if (!token) {
                this.user = null;
                return;
            }

            if (!this.accessToken) return;

            try {
                const response = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                this.user = response.data.user;
                this.saveToStorage();
            } catch (err) {
                if (err?.response?.status === 401) {
                    const refreshed = await this.tryRefresh();
                    if (!refreshed) this.logout();
                } else {
                    console.warn('restoreSession: could not call /me', err);
                }
            }
        }        
    }
})