import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'
import { formatNumber, winRate, progressBar } from '../utils/format.js'

export const buildProfile = (player, data) => {
  const xpInLevel = player.xp % 100
  const accBar = progressBar(player.correct, player.games_played, 12)
  const xpBar = progressBar(xpInLevel, 100, 12)

  return new EmbedBuilder()
    .setColor(colors.gold)
    .setTitle(`<a:crown_animated_gold:1502888744032665610>  ${player.username}  •  Level ${player.level}`)
    .setDescription([
      `<a:xp_animated:1502893496418304121> **XP** ${xpBar} \`${xpInLevel}/100\``,
      `<a:chart_animated_purple:1502894826939748363> **Accuracy** ${accBar} \`${winRate(player.correct, player.games_played)}\``,
    ].join('\n'))
    .addFields(
      { name: '<a:gem_purple_animated:1502893269846331492>  Score', value: `**${formatNumber(player.score)}** pts`, inline: true },
      { name: '🎮  Games', value: `**${player.games_played}**`, inline: true },
      { name: '<a:check_animated_green:1502887277536215223>  Correct', value: `**${player.correct}**`, inline: true },
      { name: '<a:fire_animated:1502888273469767821>  Best Streak', value: `**${player.best_streak}x**`, inline: true },
      { name: '<a:calendar_animated:1502891144714125522>  Daily Streak', value: `**${player.daily_streak}** days`, inline: true },
      { name: '<a:trophy_animated:1502890030538948729>  Achievements', value: `**${data.achievements.length} / 15** unlocked`, inline: true },
      {
        name: '<a:tag_animated_purple:1502895262442717315>  Top Categories',
        value: data.categoryBreakdown.slice(0, 3).map(c =>
          `**${c.category}** — ${winRate(c.correct, c.total)}`
        ).join('\n') || '`No data yet`',
        inline: false,
      },
      {
        name: '📜  Recent Games',
        value: data.recentHistory.slice(0, 3).map(h =>
          `${h.correct ? '<a:check_animated_green:1502887277536215223>' : '<a:x_animated_red:1502888069299441756>'}  **${h.category}** (${h.difficulty}) — +${h.score_delta} pts`
        ).join('\n') || '`No games yet`',
        inline: false,
      },
    )
    .setFooter({ text: `Server Rank: #${data.rank}` })
    .setTimestamp()
}