/**
 * Format a date string or Date object as a readable date
 * e.g. "2026-06-28T12:00:00Z" → "28 Jun 2026"
 */
export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date as time only
 * e.g. "2026-06-28T14:35:00Z" → "2:35 PM"
 */
export const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a date as date + time
 * e.g. "28 Jun 2026, 2:35 PM"
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  return `${formatDate(date)}, ${formatTime(date)}`
}

/**
 * How long ago was this date?
 * e.g. "2 minutes ago", "1 hour ago"
 */
export const timeAgo = (date) => {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * How many minutes since a date?
 */
export const minutesSince = (date) => {
  if (!date) return 0
  return Math.floor((Date.now() - new Date(date)) / 60000)
}
