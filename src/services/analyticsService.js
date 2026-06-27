import api from './api'

export const analyticsService = {
  getStats: async () => {
    const { data } = await api.get('/api/analytics/stats')
    return data
  },

  getDailyRevenue: async (days = 14) => {
    const { data } = await api.get(`/api/analytics/revenue/daily?days=${days}`)
    return data
  },

  getRevenueByCategory: async () => {
    const { data } = await api.get('/api/analytics/revenue/by-category')
    return data
  },

  getTopItems: async (limit = 10) => {
    const { data } = await api.get(`/api/analytics/top-items?limit=${limit}`)
    return data
  },

  getOrdersByStatus: async () => {
    const { data } = await api.get('/api/analytics/orders/status')
    return data
  },

  getRecentOrders: async (limit = 10) => {
    const { data } = await api.get(`/api/analytics/recent-orders?limit=${limit}`)
    return data
  },
}
