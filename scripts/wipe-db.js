import { db } from '../src/db/index.js'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Are you sure? (yes/no) ', (answer) => {
  if (answer === 'yes') {
    db.exec('DROP TABLE IF EXISTS players')
    db.exec('DROP TABLE IF EXISTS game_history')
    db.exec('DROP TABLE IF EXISTS achievements_unlocked')
    db.exec('DROP TABLE IF EXISTS custom_questions')
    db.exec('DROP TABLE IF EXISTS daily_entries')
    db.exec('DROP TABLE IF EXISTS duels')
    db.exec('DROP TABLE IF EXISTS bans')
    db.exec('DROP TABLE IF EXISTS migrations')
    console.log('Wiped')
  }
  rl.close()
})