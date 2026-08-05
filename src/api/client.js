import axios from 'axios'

// ponytail: hardcoded fallback to the working backend — admin nginx /api proxy has a dead BACKEND_URL.
// Remove this fallback (back to '/api') once BACKEND_URL is fixed on the Railway admin service.
const DEFAULT_API_URL = 'https://retail-backend-production-aa62.up.railway.app/api'

const configured = import.meta.env.VITE_API_URL || ''
const baseURL =
  configured && !(configured.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:')
    ? configured
    : DEFAULT_API_URL

const api = axios.create({ baseURL })

// ponytail: backend returns relative /uploads/... paths; resolve them against the backend origin
export const fileUrl = (u) => (u && u.startsWith('/uploads/') ? baseURL.replace(/\/api$/, '') + u : u)

// absolute backend URL for browser-level fetches (window.open etc.) that bypass axios
export const apiUrl = (p) => baseURL + p

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
