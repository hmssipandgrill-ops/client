export const ORDER_STATUSES = ['pending', 'received', 'preparing', 'ready', 'served', 'cancelled']

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.12)',
    border: 'rgba(201,168,76,0.35)',
  },
  received: {
    label: 'Received',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.35)',
  },
  preparing: {
    label: 'Preparing',
    color: '#C41E3A',
    bg: 'rgba(196,30,58,0.12)',
    border: 'rgba(196,30,58,0.35)',
  },
  ready: {
    label: 'Ready!',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.35)',
  },
  served: {
    label: 'Served',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.12)',
    border: 'rgba(107,114,128,0.35)',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.35)',
  },
}

/**
 * Returns the next logical status in the order flow
 * Returns null if at the end of the flow
 */
export const getNextStatus = (current) => {
  const flow = ['pending', 'received', 'preparing', 'ready', 'served']
  const idx = flow.indexOf(current)
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null
}

/**
 * Returns true if the order is still active (not served or cancelled)
 */
export const isActiveOrder = (status) => {
  return ['pending', 'received', 'preparing', 'ready'].includes(status)
}

/**
 * Returns true if the order is overdue (pending/received for > 15 min)
 */
export const isOverdue = (order) => {
  if (!['pending', 'received'].includes(order.status)) return false
  const age = Math.floor((Date.now() - new Date(order.createdAt)) / 60000)
  return age > 15
}
