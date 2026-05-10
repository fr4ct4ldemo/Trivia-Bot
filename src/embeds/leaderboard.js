import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'
import { formatNumber, winRate } from '../utils/format.js'

export const buildLeaderboard = (rows, options) => {
  const rankLine = (row, i) => {
    const rank = (options.page - 1) * 10 + i + 1
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `\`#${rank}\``
    const crown = rank === 1 ? '<a:crown_animated_gold:1502888744032665610> ' : ''
    return `${crown}${medal} **${row.username}** — <a:gem_purple_animated:1502893269846331492> ${formatNumber(row.score)} pts  •  Lv.**${row.level}**  •  ${winRate(row.correct, row.games_played)} acc`
  }

  return new EmbedBuilder()
    .setColor(colors.gold)
    .setTitle(`<a:crown_animated_gold:1502888744032665610>  ${options.scope} Leaderboard`)
    .setDescription(rows.map(rankLine).join('\n\n'))
    .setFooter({ text: `Page ${options.page} of ${options.totalPages}  •  Use buttons to navigate` })
    .setTimestamp()
}

export const buildSessionLeaderboard = (results, username) => {
  const totalScore = results.reduce((sum, r) => sum + r.scoreDelta, 0)
  const totalCorrect = results.filter(r => r.correct).length
  const accuracy = Math.round((totalCorrect / results.length) * 100)
  const perfLabel = totalCorrect === results.length ? '🏆 Perfect!' : totalCorrect >= 4 ? '⭐ Excellent' : totalCorrect >= 3 ? '👍 Good' : totalCorrect >= 2 ? '📚 Keep Practicing' : '💀 Rough Game'

  const breakdown = results.map((r, i) => {
    const icon = r.correct
      ? '<a:check_animated_green:1502887277536215223>'
      : r.timedOut
        ? '<a:timer_animated:1502890625874526362>'
        : '<a:x_animated_red:1502888069299441756>'
    const detail = r.timedOut ? '`Timed out`' : r.correct ? `**+${r.scoreDelta} pts**` : '`Wrong`'
    return `${icon} **Q${i + 1}** ${detail}  —  *${r.correctAnswer}*`
  }).join('\n')

  return new EmbedBuilder()
    .setColor(totalCorrect >= 4 ? colors.correct : totalCorrect >= 2 ? colors.primary : colors.wrong)
    .setTitle(`<a:trophy_animated:1502890030538948729>  Game Over — ${perfLabel}`)
    .setDescription([
      `> **${username}** finished the round!`,
      '',
      '──────────────────────',
      breakdown,
      '──────────────────────',
    ].join('\n'))
    .addFields(
      { name: '<a:gem_purple_animated:1502893269846331492>  Earned', value: `**+${totalScore}** pts`, inline: true },
      { name: '<a:chart_animated_purple:1502894826939748363>  Accuracy', value: `**${accuracy}%**`, inline: true },
      { name: '<a:check_animated_green:1502887277536215223>  Correct', value: `**${totalCorrect} / ${results.length}**`, inline: true },
    )
    .setFooter({ text: 'Play again with /trivia play!' })
    .setTimestamp()
}