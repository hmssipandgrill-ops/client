import api from './api'

export const contactService = {
  submit: async (payload) => {
    const { data } = await api.post('/api/contact', payload)
    return data
  },

  getAll: async ({ page = 1, limit = 20 } = {}) => {
    const { data } = await api.get(`/api/contact?page=${page}&limit=${limit}`)
    return data
  },

  remove: async (id) => {
    const { data } = await api.delete(`/api/contact/${id}`)
    return data
  },
}
