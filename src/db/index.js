import Database from 'better-sqlite3'
import { runMigrations } from './migrations.js'

const db = new Database('./data/trivia.db')
runMigrations(db)

export { db }