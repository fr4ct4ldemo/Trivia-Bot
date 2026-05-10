const timers = new Map()

export const startTimer = ({ seconds, onTick, onExpire }) => {
  let remaining = seconds
  const id = setInterval(() => {
    remaining -= 5
    if (remaining <= 0) {
      clearInterval(id)
      timers.delete(id)
      onExpire()
      return
    }
    onTick(remaining)
  }, 5000)
  timers.set(id, id)
  return id
}

export const clearTimer = (id) => {
  clearInterval(id)
  timers.delete(id)
}