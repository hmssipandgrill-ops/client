/**
 * Format a number as Nigerian Naira
 * e.g. 4500 → "₦4,500"
 */
export const formatNaira = (amount) => {
  if (amount === null || amount === undefined) return '₦0'
  return '₦' + Number(amount).toLocaleString('en-NG')
}

/**
 * Format a number with compact suffix for large values
 * e.g. 1500000 → "₦1.5M"
 */
export const formatNairaCompact = (amount) => {
  if (!amount) return '₦0'
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`
  return formatNaira(amount)
}

/**
 * Calculate percentage change between two values
 * e.g. (100, 80) → "+25.0%"
 */
export const percentChange = (current, previous) => {
  if (!previous) return null
  const pct = ((current - previous) / previous) * 100
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}
