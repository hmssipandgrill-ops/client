import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [tableNumber, setTableNumber] = useState('')

  const addItem = (item, size = null, qty = 1) => {
    const key = item._id + (size ? '-' + size.label : '')
    setItems(prev => {
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...item, key, selectedSize: size, qty, price: size ? size.price : item.basePrice }]
    })
  }

  const removeItem = (key) => setItems(prev => prev.filter(i => i.key !== key))

  const updateQty = (key, qty) => {
    if (qty < 1) return removeItem(key)
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, tableNumber, setTableNumber }}>
      {children}
    </CartContext.Provider>
  )
}
