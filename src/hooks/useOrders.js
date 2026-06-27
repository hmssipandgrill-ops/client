import { useState, useEffect, useCallback } from 'react'
import { orderService } from '../services/orderService'
import { useSocket } from '../context/SocketContext'

export function useOrders(options = {}) {
  const { status, limit = 50, autoRefresh = true } = options
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const socket = useSocket()

  const fetch = useCallback(async () => {
    try {
      setError(null)
      const data = await orderService.getAll({ status, limit })
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [status, limit])

  useEffect(() => {
    fetch()
  }, [fetch])

  // Real-time updates via socket
  useEffect(() => {
    if (!socket || !autoRefresh) return

    const handleNew = (order) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === order._id)
        return exists ? prev : [order, ...prev]
      })
    }

    const handleUpdate = (order) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)))
    }

    const handleDelete = ({ orderId }) => {
      setOrders((prev) => prev.filter((o) => o._id !== orderId))
    }

    socket.on('new-order', handleNew)
    socket.on('order-updated', handleUpdate)
    socket.on('order-deleted', handleDelete)

    return () => {
      socket.off('new-order', handleNew)
      socket.off('order-updated', handleUpdate)
      socket.off('order-deleted', handleDelete)
    }
  }, [socket, autoRefresh])

  return { orders, loading, error, refetch: fetch, setOrders }
}
