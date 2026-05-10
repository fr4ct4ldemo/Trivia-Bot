const cooldowns = new Map()

export const check = (userId, command) => {
  const key = `${userId}-${command}`
  const end = cooldowns.get(key)
  if (!end) return 0
  const remaining = end - Date.now()
  return remaining > 0 ? remaining : 0
}

export const set = (userId, command, ms) => {
  const key = `${userId}-${command}`
  cooldowns.set(key, Date.now() + ms)
}

export const clear = (userId, command) => {
  const key = `${userId}-${command}`
  cooldowns.delete(key)
}