import { SESSION_TTL } from '../config/constants.js'

const sessions = new Map()
const timeouts = new Map()

export const create = (key, data) => {
  sessions.set(key, { ...data, created: Date.now() })
  const timeout = setTimeout(() => destroy(key), SESSION_TTL)
  timeouts.set(key, timeout)
}

export const get = (key) => sessions.get(key)

export const destroy = (key) => {
  sessions.delete(key)
  const timeout = timeouts.get(key)
  if (timeout) clearTimeout(timeout)
  timeouts.delete(key)
}