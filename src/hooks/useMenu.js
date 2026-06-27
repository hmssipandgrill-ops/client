import { useState, useEffect, useCallback } from 'react'
import { menuService } from '../services/menuService'

export function useMenu(options = {}) {
  const { category, search, featured, limit = 12, page = 1 } = options
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await menuService.getAll({ category, search, featured, limit, page })
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }, [category, search, featured, limit, page])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { items, total, loading, error, refetch: fetch }
}

export function useMenuItem(id) {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    menuService.getOne(id)
      .then((data) => setItem(data.item))
      .catch((err) => setError(err.response?.data?.message || 'Item not found'))
      .finally(() => setLoading(false))
  }, [id])

  return { item, loading, error }
}
