import api from './api'

export const categoryService = {
  getAll: async (includeInactive = false) => {
    const { data } = await api.get(`/api/categories${includeInactive ? '?includeInactive=true' : ''}`)
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/api/categories', payload)
    return data
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/api/categories/${id}`, payload)
    return data
  },
  remove: async (id) => {
    const { data } = await api.delete(`/api/categories/${id}`)
    return data
  },
}
