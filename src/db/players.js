import { db } from './index.js'

export const getPlayer = (userId, username) => {
  let player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId)
  if (!player) {
    db.prepare('INSERT INTO players (user_id, username) VALUES (?, ?)').run(userId, username)
    player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId)
  }
  return player
}

export const updateAfterGame = (userId, { correct, scoreDelta, streak, timeTaken, category, difficulty }) => {
  const update = db.prepare(`
    UPDATE players SET
      score = score + ?,
      xp = xp + ?,
      streak = ?,
      best_streak = MAX(best_streak, ?),
      games_played = games_played + 1,
      correct = correct + ?,
      wrong = wrong + ?
    WHERE user_id = ?
  `)
  const xpGained = correct ? Math.floor(scoreDelta / 10) : 0  // rough, adjust
  update.run(scoreDelta, xpGained, streak, streak, correct ? 1 : 0, correct ? 0 : 1, userId)
  const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId)
  const newLevel = Math.floor(player.xp / 100) + 1
  if (newLevel > player.level) {
    db.prepare('UPDATE players SET level = ? WHERE user_id = ?').run(newLevel, userId)
    return { leveled: true, newLevel }
  }
  return { leveled: false }
}

export const resetStreak = (userId) => {
  db.prepare('UPDATE players SET streak = 0 WHERE user_id = ?').run(userId)
}

export const getLeaderboard = (limit = 10) => {
  return db.prepare('SELECT * FROM players ORDER BY score DESC LIMIT ?').all(limit)
}

export const getStats = (userId) => {
  return db.prepare('SELECT * FROM players WHERE user_id = ?').get(userId)
}

export const getCategoryBreakdown = (userId) => {
  return db.prepare(`
    SELECT category, COUNT(*) as total, SUM(correct) as correct
    FROM game_history
    WHERE user_id = ?
    GROUP BY category
  `).all(userId)
}

export const addXp = (userId, amount) => {
  const player = db.prepare('SELECT xp, level FROM players WHERE user_id = ?').get(userId)
  const newXp = player.xp + amount
  const newLevel = Math.floor(newXp / 100) + 1
  db.prepare('UPDATE players SET xp = ?, level = ? WHERE user_id = ?').run(newXp, newLevel, userId)
  return { leveled: newLevel > player.level, newLevel }
}

export const setBanned = (userId, reason, bannedBy) => {
  db.prepare('INSERT OR REPLACE INTO bans (user_id, reason, banned_by) VALUES (?, ?, ?)').run(userId, reason, bannedBy)
  db.prepare('UPDATE players SET banned = 1, ban_reason = ? WHERE user_id = ?').run(reason, userId)
}

export const unban = (userId) => {
  db.prepare('DELETE FROM bans WHERE user_id = ?').run(userId)
  db.prepare('UPDATE players SET banned = 0, ban_reason = NULL WHERE user_id = ?').run(userId)
}

export const isBanned = (userId) => {
  const ban = db.prepare('SELECT * FROM bans WHERE user_id = ?').get(userId)
  return !!ban
}