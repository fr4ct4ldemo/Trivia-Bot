const migrations = [
  (db) => db.exec(`
    CREATE TABLE players (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0,
      correct INTEGER DEFAULT 0,
      wrong INTEGER DEFAULT 0,
      daily_streak INTEGER DEFAULT 0,
      last_daily TEXT,
      banned INTEGER DEFAULT 0,
      ban_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `),
  (db) => db.exec(`
    CREATE TABLE game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      category TEXT,
      difficulty TEXT,
      correct INTEGER,
      score_delta INTEGER,
      streak_at_time INTEGER,
      time_taken INTEGER,
      played_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `),
  (db) => db.exec(`
    CREATE TABLE achievements_unlocked (
      user_id TEXT,
      achievement_id TEXT,
      unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, achievement_id)
    )
  `),
  (db) => db.exec(`
    CREATE TABLE custom_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      question TEXT,
      correct TEXT,
      wrong1 TEXT,
      wrong2 TEXT,
      wrong3 TEXT,
      category TEXT,
      difficulty TEXT,
      added_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `),
  (db) => db.exec(`
    CREATE TABLE daily_entries (
      user_id TEXT,
      date TEXT,
      correct INTEGER,
      score INTEGER,
      PRIMARY KEY (user_id, date)
    )
  `),
  (db) => db.exec(`
    CREATE TABLE duels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenger_id TEXT,
      opponent_id TEXT,
      winner_id TEXT,
      rounds INTEGER,
      played_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `),
  (db) => db.exec(`
    CREATE TABLE bans (
      user_id TEXT PRIMARY KEY,
      reason TEXT,
      banned_by TEXT,
      banned_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `),
]

export const runMigrations = (db) => {
  db.exec(`CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, name TEXT UNIQUE, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)`)
  const applied = db.prepare('SELECT name FROM migrations').all().map(r => r.name)
  for (let i = 0; i < migrations.length; i++) {
    const name = `migration_${i}`
    if (!applied.includes(name)) {
      migrations[i](db)
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name)
    }
  }
}