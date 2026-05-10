<p align="center">
  <img src="mr__obvious.png" alt="Mr. Obvious Trivia Bot Banner" width="100%" />
</p>

<h1 align="center">🎓 Mr. Obvious — Discord Trivia Bot</h1>

<p align="center">
  A feature-rich Discord trivia bot built with <strong>Node.js</strong>, <strong>discord.js v14</strong>, and <strong>SQLite</strong> via <code>better-sqlite3</code>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white" alt="discord.js" />
  <img src="https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="MIT License" />
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Database Schema](#️-database-schema)
- [Commands](#-commands)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Scripts](#️-scripts)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎮 **Solo Play** | Start a trivia game with custom category, difficulty, and time limit |
| ⚔️ **Duels** | Challenge another user to a head-to-head trivia match |
| 🏆 **Tournaments** | Multi-player tournament bracket support |
| 📊 **Leaderboard** | Server-wide rankings by score |
| 🎖️ **Achievements** | Unlock badges and milestones as you play |
| 📅 **Daily Challenges** | One unique challenge per day with streak tracking |
| 👤 **Player Profiles** | View your stats, level, XP, and streaks |
| 🛡️ **Admin Panel** | Ban/unban players, reset stats, add/remove custom questions, send announcements |
| 🗃️ **Custom Questions** | Per-server custom question pools managed via slash commands |
| 📈 **Game History** | Full history of every game played, stored in SQLite |

---

## 📁 Project Structure

```
trivia/
├── data/
│   ├── trivia.db              # SQLite database (auto-created)
│   └── custom-questions.json  # Seed data for questions
├── scripts/
│   ├── deploy.js              # Register slash commands with Discord
│   ├── seed.js                # Seed the database with questions
│   └── wipe-db.js             # Wipe the database (dev/reset)
├── src/
│   ├── api/                   # External API integrations (e.g. Open Trivia DB)
│   ├── commands/
│   │   ├── admin/             # /admin — ban, unban, reset, addquestion, announce
│   │   ├── social/            # /leaderboard, /profile, /achievements
│   │   ├── stats/             # /stats — player statistics
│   │   ├── trivia/            # /trivia — play, duel, tournament
│   │   └── utility/           # Utility slash commands
│   ├── config/                # Category and difficulty configuration
│   ├── core/                  # Bot client initialization
│   ├── db/                    # Database access layer
│   │   ├── index.js           # DB connection + migration runner
│   │   ├── migrations.js      # All schema migrations
│   │   ├── players.js         # Player CRUD
│   │   ├── questions.js       # Question queries
│   │   ├── achievements.js    # Achievement logic
│   │   └── history.js         # Game history queries
│   ├── embeds/                # Discord embed builders
│   ├── events/                # Discord event handlers
│   ├── game/                  # Core game engine
│   ├── scheduler/             # node-cron scheduled tasks (daily challenges)
│   └── utils/                 # Shared helpers
├── .env                       # Environment variables (not committed)
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

<p align="center">
  <img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite Database" />
</p>

All data is stored in a local SQLite file at `data/trivia.db`, managed via `better-sqlite3`. Migrations run automatically on startup.

### `players`
Stores every user who has interacted with the bot.

| Column | Type | Description |
|---|---|---|
| `user_id` | TEXT PK | Discord user ID |
| `username` | TEXT | Display name |
| `score` | INTEGER | Total score |
| `xp` | INTEGER | Experience points |
| `level` | INTEGER | Current level |
| `streak` | INTEGER | Current answer streak |
| `best_streak` | INTEGER | All-time best streak |
| `games_played` | INTEGER | Total games played |
| `correct` / `wrong` | INTEGER | Answer counts |
| `daily_streak` | INTEGER | Daily challenge streak |
| `banned` | INTEGER | 0 = active, 1 = banned |
| `ban_reason` | TEXT | Reason for ban |

### `game_history`
One row per game session.

| Column | Type | Description |
|---|---|---|
| `user_id` | TEXT | Player reference |
| `category` | TEXT | Question category |
| `difficulty` | TEXT | easy / medium / hard |
| `correct` | INTEGER | Questions answered correctly |
| `score_delta` | INTEGER | Score change this session |
| `streak_at_time` | INTEGER | Streak at time of play |
| `time_taken` | INTEGER | Milliseconds to answer |

### `custom_questions`
Per-guild custom question pool.

| Column | Type | Description |
|---|---|---|
| `guild_id` | TEXT | Discord server ID |
| `question` | TEXT | Question text |
| `correct` | TEXT | Correct answer |
| `wrong1–3` | TEXT | Three incorrect options |
| `category` | TEXT | Category label |
| `difficulty` | TEXT | easy / medium / hard |
| `added_by` | TEXT | Discord user ID of creator |

### Other Tables
- **`achievements_unlocked`** — tracks which achievements each user has earned
- **`daily_entries`** — one row per user per date for daily challenge tracking
- **`duels`** — records of duel results (challenger, opponent, winner, rounds)
- **`bans`** — ban log with reason, banned_by, and timestamp
- **`migrations`** — internal table tracking applied schema migrations

---

## 💬 Commands

### `/trivia`
| Subcommand | Options | Description |
|---|---|---|
| `play` | `category`, `difficulty`, `time` | Start a solo trivia game |
| `duel` | `user`, `rounds`, `difficulty` | Challenge a user to a duel |
| `tournament` | — | Start or join a tournament |

### `/admin` *(Administrator only)*
| Subcommand | Options | Description |
|---|---|---|
| `ban` | `user`, `reason` | Ban a player |
| `unban` | `user` | Unban a player |
| `reset` | `user` | Reset a player's stats to zero |
| `addquestion` | `question`, `correct`, `wrong1–3`, `category`, `difficulty` | Add a custom question |
| `removequestion` | `id` | Remove a custom question by ID |
| `listquestions` | — | List all custom questions for this server |
| `announce` | `message`, `channel` | Send a bot announcement |

### Social & Stats
| Command | Description |
|---|---|
| `/leaderboard` | View the server's top players |
| `/profile` | View your player profile (level, XP, stats) |
| `/achievements` | View earned and available achievements |
| `/stats` | Detailed personal statistics |

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js v18+**
- A Discord bot application with a valid token ([Discord Developer Portal](https://discord.com/developers/applications))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/trivia-bot.git
   cd trivia-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your bot token, client ID, and guild ID
   ```

4. **Seed the database** *(optional — loads starter questions)*
   ```bash
   npm run seed
   ```

5. **Register slash commands with Discord**
   ```bash
   npm run deploy
   ```

6. **Start the bot**
   ```bash
   npm start
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id
GUILD_ID=your_test_guild_id   # For development/local command deployment
```

---

## 🛠️ Scripts

| Script | Command | Description |
|---|---|---|
| Start bot | `npm start` | Runs `src/core/client.js` |
| Deploy commands | `npm run deploy` | Registers slash commands via Discord REST API |
| Seed database | `npm run seed` | Populates the DB with starter trivia questions |
| Wipe database | `npm run wipe` | Deletes all data (use with caution!) |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">Made with ☕ and too many trivia questions.</p>