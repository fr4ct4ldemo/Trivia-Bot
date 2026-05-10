import { db } from './index.js'

export const logGame = (entry) => {
  db.prepare(`
    INSERT INTO game_history (user_id, category, difficulty, correct, score_delta, streak_at_time, time_taken)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(entry.userId, entry.category, entry.difficulty, entry.correct, entry.scoreDelta, entry.streak, entry.timeTaken)
}

export const getRecent = (userId, limit = 10) => {
  return db.prepare('SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC LIMIT ?').all(userId, limit)
}