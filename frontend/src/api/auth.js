/* appel authentification login */
import api from './axios'

export async function loginRequest(email, password) {
  const resp = await api.post('/auth/login', { email, password })
  return resp.data
}

export async function refreshToken(refreshToken) {
  const resp = await api.post('/auth/refresh', { refreshToken })
  return resp.data
}

export async function meRequest() {
  const resp = await api.get('/me')
  return resp.data
}
