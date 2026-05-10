import { isBanned } from '../db/players.js'
import { check } from '../utils/cooldown.js'
import { COOLDOWN_TRIVIA } from '../config/constants.js'

export const validateAnswer = (selected, correct) => selected === correct

export const isExpired = (session) => Date.now() - session.created > SESSION_TTL

export const canPlay = (userId) => {
  if (isBanned(userId)) return false
  return check(userId, 'trivia') === 0
}