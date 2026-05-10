export const formatNumber = (n) => n.toLocaleString()

export const formatTime = (ms) => {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}m ${s}s`
}

export const progressBar = (current, max, length = 10) => {
  const filled = Math.round((current / max) * length)
  const empty = length - filled
  return '█'.repeat(filled) + '░'.repeat(empty)
}

export const winRate = (correct, total) => {
  if (total === 0) return '0%'
  return ((correct / total) * 100).toFixed(1) + '%'
}

export const relativeTime = (isoString) => {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} days ago`
  if (hours > 0) return `${hours} hours ago`
  if (minutes > 0) return `${minutes} minutes ago`
  return 'just now'
}

export const timerBar = (remaining, total, length = 20) => {
  const ratio = Math.max(0, remaining / total)
  const filled = Math.round(ratio * length)
  const empty = length - filled

  let filledChar, emptyChar
  if (ratio > 0.5) {
    filledChar = '🟩'
    emptyChar = '⬛'
  } else if (ratio > 0.25) {
    filledChar = '🟨'
    emptyChar = '⬛'
  } else {
    filledChar = '🟥'
    emptyChar = '⬛'
  }

  return filledChar.repeat(filled) + emptyChar.repeat(empty) + `  \`${remaining}s\``
}