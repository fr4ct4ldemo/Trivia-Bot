import { db } from './index.js'
import { achievements } from '../config/achievements.js'

export const getUnlocked = (userId) => {
  return db.prepare('SELECT achievement_id FROM achievements_unlocked WHERE user_id = ?').all(userId).map(r => r.achievement_id)
}

export const unlock = (userId, achievementId) => {
  db.prepare('INSERT OR IGNORE INTO achievements_unlocked (user_id, achievement_id) VALUES (?, ?)').run(userId, achievementId)
}

export const checkAndUnlock = (userId, stats, context) => {
  const unlocked = getUnlocked(userId)
  const newly = []
  for (const ach of achievements) {
    if (unlocked.includes(ach.id)) continue
    // check condition, simplified
    let met = false
    switch (ach.condition) {
      case 'games_played >= 1': met = stats.games_played >= 1; break
      case 'streak >= 5': met = stats.streak >= 5; break
      case 'streak >= 10': met = stats.streak >= 10; break
      case 'correct >= 100': met = stats.correct >= 100; break
      case 'correct >= 500': met = stats.correct >= 500; break
      case 'time_taken < 5': met = context.timeTaken < 5; break
      // others need more logic, but for now
      default: met = false
    }
    if (met) {
      unlock(userId, ach.id)
      newly.push(ach)
    }
  }
  return newly
}