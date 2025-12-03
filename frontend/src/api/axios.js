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

export default api
