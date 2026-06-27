import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // Token expired or invalid — clear auth and redirect to login
    if (status === 401) {
      localStorage.removeItem('hms_token')
      delete api.defaults.headers.common['Authorization']
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }
    }

    return Promise.reject(error)
  }
)

export default api
