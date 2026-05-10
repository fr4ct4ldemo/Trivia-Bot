import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'

export const buildDailyChallenge = (data) => {
  return new EmbedBuilder()
    .setColor(colors.daily)
    .setTitle(`<a:calendar_animated:1502891144714125522>  Daily Challenge — ${data.date}`)
    .setDescription([
      '> 🌟 One question per day. Make it count!',
      '',
      `> ${data.question}`,
    ].join('\n'))
    .setFooter({ text: 'Resets at 8:00 AM daily.' })
    .setTimestamp()
}

export const buildDailyLeaderboard = (entries) => {
  return new EmbedBuilder()
    .setColor(colors.daily)
    .setTitle('<a:crown_animated_gold:1502888744032665610>  Daily Leaderboard')
    .setDescription(
      entries.length
        ? entries.map((e, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `\`#${i + 1}\``
            return `${medal}  **${e.username}** — ${e.score} pts`
          }).join('\n')
        : '`No entries yet today.`'
    )
    .setFooter({ text: 'Compete daily to stay on top!' })
    .setTimestamp()
}
