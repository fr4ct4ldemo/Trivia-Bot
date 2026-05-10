<p align="center">
  <img src="mr__obvious.png" alt="Mr. Obvious — Discord Trivia Bot" width="100%" />
</p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 18+" /></a>
  <a href="https://discord.js.org"><img src="https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white" alt="discord.js v14" /></a>
  <a href="https://www.sqlite.org"><img src="https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-f0c040?style=flat-square" alt="MIT License" /></a>
</p>

Trivia bot for Discord. Uses slash commands, runs on SQLite, and you host it yourself.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Slash Commands](#slash-commands)
- [Database Schema](#database-schema)
- [Scripts](#scripts)
- [Bot Permissions](#bot-permissions)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Solo games with category and difficulty options
- Head-to-head duels against other players
- Tournaments for multiple participants
- Real-time leaderboards
- Achievement system for milestones
- Daily challenges with streak tracking
- Player profiles showing stats and progress
- Custom questions that admins can add per server
- Admin tools for banning, resetting stats, and announcements
- Full game history logging

---

## Quick Start

Need Node.js 18+ and a Discord bot token from the developer portal.

```bash
# Clone and install
git clone https://github.com/your-username/Trivia-Bot.git
cd Trivia-Bot
npm install

# Set up config
cp .env.example .env
# Edit .env with your DISCORD_TOKEN, CLIENT_ID, GUILD_ID

# Optional: Add some starter questions
npm run seed

# Register commands
npm run deploy

# Run it
npm start
```

Database gets created automatically in `data/trivia.db`.

---

## Project Structure

```
mr-obvious-bot/
├── data/
│   ├── trivia.db               # SQLite database — auto-created on startup
│   └── custom-questions.json   # Starter question seed data
│
├── scripts/
│   ├── deploy.js               # Registers slash commands via Discord REST API
│   ├── seed.js                 # Seeds the database with starter questions
│   └── wipe-db.js              # Drops all tables (destructive — dev use only)
│
├── src/
│   ├── api/                    # External data sources (e.g. Open Trivia DB)
│   ├── commands/
│   │   ├── admin/              # /admin — moderation and server management
│   │   ├── social/             # /leaderboard, /profile, /achievements
│   │   ├── stats/              # /stats — personal statistics
│   │   ├── trivia/             # /trivia — play, duel, tournament
│   │   └── utility/            # Miscellaneous utility commands
│   ├── config/
│   │   ├── categories.js       # Question category definitions
│   │   └── difficulties.js     # Difficulty level configuration
│   ├── core/
│   │   └── client.js           # Bot entrypoint — creates and starts the client
│   ├── db/
│   │   ├── index.js            # Opens the database and runs migrations
│   │   ├── migrations.js       # Versioned schema migrations
│   │   ├── players.js          # Player read/write helpers
│   │   ├── questions.js        # Question query helpers
│   │   ├── achievements.js     # Achievement unlock logic
│   │   └── history.js          # Game history queries
│   ├── embeds/                 # discord.js EmbedBuilder factories
│   ├── events/                 # Discord gateway event handlers
│   ├── game/
│   │   └── engine.js           # Core game loop — question delivery, scoring, timers
│   ├── scheduler/              # node-cron jobs (daily challenge reset, etc.)
│   └── utils/                  # Shared utility functions
│
├── .env                        # Secret config — never commit this
├── .env.example                # Template for required environment variables
├── .gitignore
└── package.json
```

---

## Configuration

Copy `.env.example` to `.env` and fill in these:

```env
# Required
DISCORD_TOKEN=          # Bot token from the Discord Developer Portal
CLIENT_ID=              # Application (client) ID
GUILD_ID=               # Guild ID for development command deployment
```

For production, you can deploy commands globally by tweaking the deploy script. Guild deployment is faster for testing.

---

## Slash Commands

### `/trivia` — Game Commands

- `play` — Start a solo game, optional category/difficulty/time
- `duel` — Challenge someone to a head-to-head match
- `tournament` — Join or create a tournament

### `/admin` — Server Management *(requires Administrator)*

- `ban` — Block a user from using the bot
- `unban` — Restore access
- `reset` — Wipe a player's stats
- `addquestion` — Add a custom question
- `removequestion` — Delete a custom question by ID
- `listquestions` — Show all custom questions
- `announce` — Send a message through the bot

### Other Commands

- `/profile` — Your stats, level, streaks
- `/leaderboard` — Server rankings
- `/achievements` — Unlocked badges
- `/stats` — Detailed game history

---

## Database Schema

<p align="center">
  <img src="https://img.shields.io/badge/Storage-SQLite%20%28better--sqlite3%29-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

Everything's in `data/trivia.db`. Migrations run automatically from `src/db/migrations.js`.

### `players`

| Column | Type | Notes |
|---|---|---|
| `user_id` | `TEXT` · PK | Discord snowflake |
| `username` | `TEXT` | Display name at time of last interaction |
| `score` | `INTEGER` | Cumulative score across all games |
| `xp` | `INTEGER` | Experience points (used to calculate `level`) |
| `level` | `INTEGER` | Derived from XP thresholds |
| `streak` | `INTEGER` | Current consecutive correct answers |
| `best_streak` | `INTEGER` | All-time personal best streak |
| `games_played` | `INTEGER` | Total sessions started |
| `correct` / `wrong` | `INTEGER` | Lifetime answer counts |
| `daily_streak` | `INTEGER` | Consecutive days with a completed daily challenge |
| `last_daily` | `TEXT` | ISO date of last daily completion |
| `banned` | `INTEGER` | `1` = banned, `0` = active |
| `ban_reason` | `TEXT` | Human-readable ban reason |
| `created_at` | `TEXT` | ISO timestamp of first interaction |

### `game_history`

| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER` · PK | Auto-increment |
| `user_id` | `TEXT` | References `players.user_id` |
| `category` | `TEXT` | Category name |
| `difficulty` | `TEXT` | `easy` / `medium` / `hard` |
| `correct` | `INTEGER` | Correct answers in this session |
| `score_delta` | `INTEGER` | Score change applied after this session |
| `streak_at_time` | `INTEGER` | Player's streak at the moment of play |
| `time_taken` | `INTEGER` | Total milliseconds to complete the session |
| `played_at` | `TEXT` | ISO timestamp |

### `custom_questions`

| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER` · PK | Auto-increment; used with `/admin removequestion` |
| `guild_id` | `TEXT` | Scoped per Discord server |
| `question` | `TEXT` | Question text |
| `correct` | `TEXT` | Correct answer |
| `wrong1` `wrong2` `wrong3` | `TEXT` | Distractor answers |
| `category` | `TEXT` | Category label shown in-game |
| `difficulty` | `TEXT` | `easy` / `medium` / `hard` |
| `added_by` | `TEXT` | Discord user ID of the admin who added it |
| `created_at` | `TEXT` | ISO timestamp |

### Additional Tables

| Table | Purpose |
|---|---|
| `achievements_unlocked` | Tracks `(user_id, achievement_id)` pairs with unlock timestamp |
| `daily_entries` | One row per `(user_id, date)` for daily challenge deduplication |
| `duels` | Records challenger, opponent, winner, round count, and timestamp |
| `bans` | Audit log of all bans with reason, issuer, and timestamp |
| `migrations` | Internal table — tracks which migrations have been applied |

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the bot (`src/core/client.js`) |
| `npm run deploy` | Register or update slash commands with Discord |
| `npm run seed` | Populate `trivia.db` with starter questions from `custom-questions.json` |
| `npm run wipe` | **Destructive.** Drop all data — use only in development |

---

## Bot Permissions

When adding the bot to a server, the OAuth2 invite URL should request the following permissions:

| Permission | Required for |
|---|---|
| `Send Messages` | All responses |
| `Embed Links` | Rich embed replies |
| `Read Message History` | Interaction context |
| `Use Application Commands` | Slash commands |
| `Manage Messages` | Cleaning up timed-out game prompts *(optional)* |

Minimum required scope: `bot` + `applications.commands`.

---

## Contributing

Fork it, make a branch, keep commits small. Test commands on a dev guild before PRing. Issues are fine for bugs or ideas.

---

## License

MIT — see [LICENSE](LICENSE) for the full text.

---

<p align="center">
  <sub>Built with discord.js · Powered by better-sqlite3 · Questions sourced from <a href="https://opentdb.com">Open Trivia DB</a></sub>
</p>
