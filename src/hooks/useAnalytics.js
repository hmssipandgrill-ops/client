import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'

export function useAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      setError(null)
      const data = await analyticsService.getStats()
      setStats(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { stats, loading, error, refetch: fetch }
}

export function useDailyRevenue(days = 14) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.getDailyRevenue(days)
      .then((res) => setData(res.data || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [days])

  return { data, loading }
}

export function useTopItems(limit = 10) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.getTopItems(limit)
      .then((res) => setItems(res.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [limit])

  return { items, loading }
}
