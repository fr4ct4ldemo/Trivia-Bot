import { db } from './index.js'

export const addQuestion = (guildId, data) => {
  return db.prepare(`
    INSERT INTO custom_questions (guild_id, question, correct, wrong1, wrong2, wrong3, category, difficulty, added_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(guildId, data.question, data.correct, data.wrong[0], data.wrong[1], data.wrong[2], data.category, data.difficulty, data.addedBy)
}

export const removeQuestion = (id, guildId) => {
  db.prepare('DELETE FROM custom_questions WHERE id = ? AND guild_id = ?').run(id, guildId)
}

export const getCustomQuestions = (guildId, category) => {
  return db.prepare('SELECT * FROM custom_questions WHERE guild_id = ? AND category = ?').all(guildId, category)
}

export const listCustomQuestions = (guildId) => {
  return db.prepare('SELECT id, question, category, difficulty FROM custom_questions WHERE guild_id = ?').all(guildId)
}