import api from './api'

export const ayoposService = {
  status:     async ()     => (await api.get('/api/integrations/ayopos')).data,
  pair:       async (code) => (await api.post('/api/integrations/ayopos/pair', { pairingCode: code })).data,
  sync:       async ()     => (await api.post('/api/integrations/ayopos/sync')).data,
  disconnect: async ()     => (await api.delete('/api/integrations/ayopos')).data,
}
