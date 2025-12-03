/* instance axios centralisée */
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000' // ← mettre le port du backend
})

export default api
