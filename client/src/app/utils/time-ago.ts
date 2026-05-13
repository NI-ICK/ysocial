export function timeAgo(isoDate: string) {
  const now = Date.now()
  const past = new Date(isoDate).getTime()

  const diff = Math.floor((now - past) / 1000)

  const units = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'w', seconds: 604800 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'min', seconds: 60 },
  ]

  for (const unit of units) {
    const value = Math.floor(diff / unit.seconds)
    if (value >= 1) {
      return `${value} ${unit.label}`
    }
  }

  return 'just now'
}
