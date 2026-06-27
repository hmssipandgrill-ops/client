import api from './api'

export const userService = {
  getAll: async ({ page = 1, limit = 50, role, search } = {}) => {
    const params = new URLSearchParams({ page, limit })
    if (role) params.set('role', role)
    if (search) params.set('search', search)
    const { data } = await api.get(`/api/users?${params}`)
    return data
  },

  getOne: async (id) => {
    const { data } = await api.get(`/api/users/${id}`)
    return data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/api/users/${id}`, payload)
    return data
  },

  remove: async (id) => {
    const { data } = await api.delete(`/api/users/${id}`)
    return data
  },
}
