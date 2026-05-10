import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'
import { formatNumber, winRate } from '../utils/format.js'

export const buildStats = (player, breakdown) => {
  return new EmbedBuilder()
    .setColor(colors.gold)
    .setTitle(`<a:chart_animated_purple:1502894826939748363>  ${player.username}'s Stats`)
    .addFields(
      { name: '🎮  Games Played', value: `**${player.games_played}**`, inline: true },
      { name: '<a:check_animated_green:1502887277536215223>  Correct', value: `**${player.correct}**`, inline: true },
      { name: '<a:chart_animated_purple:1502894826939748363>  Accuracy', value: `**${winRate(player.correct, player.games_played)}**`, inline: true },
      { name: '<a:fire_animated:1502888273469767821>  Best Streak', value: `**${player.best_streak}x**`, inline: true },
      { name: '<a:gem_purple_animated:1502893269846331492>  Total Score', value: `**${formatNumber(player.score)}** pts`, inline: true },
      {
        name: '<a:tag_animated_purple:1502895262442717315>  Category Breakdown',
        value: breakdown.length
          ? breakdown.map(b => `**${b.category}** — ${winRate(b.correct, b.total)}`).join('\n')
          : '`No data yet`',
        inline: false,
      },
    )
    .setTimestamp()
}

export const buildHistory = (entries) => {
  return new EmbedBuilder()
    .setColor(colors.gold)
    .setTitle('<a:chart_animated_purple:1502894826939748363>  Game History')
    .setDescription(
      entries.length
        ? entries.map(e =>
            `${e.correct ? '<a:check_animated_green:1502887277536215223>' : '<a:x_animated_red:1502888069299441756>'}  **${e.category}** (${e.difficulty}) — +${e.score_delta} pts`
          ).join('\n')
        : '`No games recorded yet.`'
    )
    .setFooter({ text: 'Showing most recent games' })
    .setTimestamp()
}
