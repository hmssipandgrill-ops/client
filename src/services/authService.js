import api from './api'

export const authService = {
  register: async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password })
    return data
  },

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    return data
  },

  getMe: async () => {
    const { data } = await api.get('/api/auth/me')
    return data
  },

  updateProfile: async (payload) => {
    const { data } = await api.put('/api/users/me/profile', payload)
    return data
  },

  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.put('/api/users/me/password', { currentPassword, newPassword })
    return data
  },
}
