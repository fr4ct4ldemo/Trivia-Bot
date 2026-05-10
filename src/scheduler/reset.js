import { db } from '../db/index.js'

export const resetWeeklyScores = () => {
  db.prepare('UPDATE players SET score = 0').run()
}