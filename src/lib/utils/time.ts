const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 7
const MONTH = DAY * 30
const YEAR = DAY * 365

export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)

  if (seconds < MINUTE) return 'just now'
  if (seconds < HOUR) {
    const m = Math.floor(seconds / MINUTE)
    return `${m}m ago`
  }
  if (seconds < DAY) {
    const h = Math.floor(seconds / HOUR)
    return `${h}h ago`
  }
  if (seconds < WEEK) {
    const d = Math.floor(seconds / DAY)
    return `${d}d ago`
  }
  if (seconds < MONTH) {
    const w = Math.floor(seconds / WEEK)
    return `${w}w ago`
  }
  if (seconds < YEAR) {
    const m = Math.floor(seconds / MONTH)
    return `${m}mo ago`
  }
  const y = Math.floor(seconds / YEAR)
  return `${y}y ago`
}
