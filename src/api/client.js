import axios from 'axios'

// ponytail: if a stale http:// VITE_API_URL is baked in, same-origin proxy is safer than a blocked mixed-content call
const configured = import.meta.env.VITE_API_URL || ''
const baseURL =
  configured && !(configured.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:')
    ? configured
    : '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
