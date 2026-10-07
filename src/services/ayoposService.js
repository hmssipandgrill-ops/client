import api from './api'

export const ayoposService = {
  status:        async ()     => (await api.get('/api/integrations/ayopos')).data,
  saveSettings:  async (body) => (await api.put('/api/integrations/ayopos/settings', body)).data,
  checkSettings: async (body) => (await api.post('/api/integrations/ayopos/settings/check', body)).data,
  pair:          async (code) => (await api.post('/api/integrations/ayopos/pair', { pairingCode: code })).data,
  sync:          async ()     => (await api.post('/api/integrations/ayopos/sync')).data,
  disconnect:    async ()     => (await api.delete('/api/integrations/ayopos')).data,
}
