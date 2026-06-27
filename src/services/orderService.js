import api from './api'

export const orderService = {
  place: async ({ items, tableNumber, notes, total }) => {
    const { data } = await api.post('/api/orders', { items, tableNumber, notes, total })
    return data
  },

  getMyOrders: async ({ page = 1, limit = 20 } = {}) => {
    const { data } = await api.get(`/api/orders/my?page=${page}&limit=${limit}`)
    return data
  },

  getAll: async ({ status, tableNumber, page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams({ page, limit })
    if (status) params.set('status', status)
    if (tableNumber) params.set('tableNumber', tableNumber)
    const { data } = await api.get(`/api/orders?${params}`)
    return data
  },

  getOne: async (id) => {
    const { data } = await api.get(`/api/orders/${id}`)
    return data
  },

  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/api/orders/${id}/status`, { status })
    return data
  },

  delete: async (id) => {
    const { data } = await api.delete(`/api/orders/${id}`)
    return data
  },
}
