/**
 * Truncate a string to a max length with ellipsis
 */
export const truncate = (str, max = 80) => {
  if (!str) return ''
  return str.length > max ? str.slice(0, max).trimEnd() + '…' : str
}

/**
 * Capitalise the first letter of every word
 */
export const titleCase = (str) => {
  if (!str) return ''
  return str.replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Get the effective display price for a menu item
 * Returns basePrice if no sizes, otherwise the lowest size price
 */
export const getItemPrice = (item) => {
  if (!item) return 0
  if (item.sizes?.length > 0) {
    return Math.min(...item.sizes.map((s) => s.price))
  }
  return item.basePrice || 0
}

/**
 * Generate a short human-readable order ID from a MongoDB ObjectId
 * e.g. "507f1f77bcf86cd799439011" → "439011"
 */
export const shortOrderId = (id) => {
  if (!id) return ''
  return id.toString().slice(-6).toUpperCase()
}

/**
 * Clamp a number between min and max
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * Deep clone an object (simple JSON-safe version)
 */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj))

/**
 * Debounce a function
 */
export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Check if a value is empty (null, undefined, empty string/array/object)
 */
export const isEmpty = (val) => {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') return val.trim().length === 0
  if (Array.isArray(val)) return val.length === 0
  if (typeof val === 'object') return Object.keys(val).length === 0
  return false
}
