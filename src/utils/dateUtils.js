export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function isToday(isoString) {
  if (!isoString) return false
  return isoString.split('T')[0] === todayISO()
}

export function isTomorrow(isoString) {
  if (!isoString) return false
  return isoString.split('T')[0] === tomorrowISO()
}

export function isPast(isoString) {
  if (!isoString) return false
  return isoString.split('T')[0] < todayISO()
}

export function formatDisplayDate(isoString) {
  if (!isoString) return ''
  // Handle both date-only "2026-04-15" and full ISO "2026-04-15T12:34:56.789Z"
  const dateStr = isoString.includes('T') ? isoString : isoString + 'T00:00:00'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelativeDate(isoString) {
  if (!isoString) return ''
  if (isToday(isoString)) return 'Today'
  if (isTomorrow(isoString)) return 'Tomorrow'
  if (isPast(isoString)) return `Overdue · ${formatDisplayDate(isoString)}`
  return formatDisplayDate(isoString)
}

export function formatDateTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
