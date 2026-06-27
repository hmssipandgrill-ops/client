import api from './api'

export const menuService = {
  getAll: async ({ category, search, featured, limit = 12, page = 1 } = {}) => {
    const params = new URLSearchParams({ limit, page })
    if (category && category !== 'All') params.set('category', category)
    if (search) params.set('search', search)
    if (featured) params.set('featured', 'true')
    const { data } = await api.get(`/api/menu?${params}`)
    return data
  },
  getOne: async (id) => {
    const { data } = await api.get(`/api/menu/${id}`)
    return data
  },
  create: async (payload) => {
    const { data } = await api.post('/api/menu', payload)
    return data
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/api/menu/${id}`, payload)
    return data
  },
  toggleActive: async (id) => {
    const { data } = await api.patch(`/api/menu/${id}/toggle`)
    return data
  },
  toggleFeatured: async (id) => {
    const { data } = await api.patch(`/api/menu/${id}/featured`)
    return data
  },
  remove: async (id) => {
    const { data } = await api.delete(`/api/menu/${id}`)
    return data
  },
  uploadImage: async (file) => {
    const form = new FormData()
    form.append('image', file)
    const { data } = await api.post('/api/upload/menu-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data   // { url, public_id }
  },
}
