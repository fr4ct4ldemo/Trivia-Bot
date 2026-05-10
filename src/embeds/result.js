import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'

export const buildResult = (data) => {
  const timeSec = (data.timeTaken / 1000).toFixed(1)
  const speedRating = data.timeTaken < 5000 ? '⚡ Lightning' : data.timeTaken < 10000 ? '🏃 Fast' : '🐢 Slow'

  const embed = new EmbedBuilder()
    .setColor(data.correct ? colors.correct : colors.wrong)
    .setTitle(data.correct
      ? '<a:check_animated_green:1502887277536215223>  Correct!'
      : '<a:x_animated_red:1502888069299441756>  Wrong!')
    .setDescription([
      data.correct
        ? `> ✨ Well done! The answer was **${data.correctAnswer}**`
        : `> The correct answer was **${data.correctAnswer}**`,
      '',
      `\`Question ${data.questionNumber} of ${data.totalQuestions}\``,
    ].join('\n'))
    .addFields(
      { name: '<a:gem_purple_animated:1502893269846331492>  Points', value: data.scoreDelta > 0 ? `**+${data.scoreDelta}** pts` : '`+0 pts`', inline: true },
      { name: '<a:xp_animated:1502893496418304121>  XP', value: `**+${data.xpGained}** XP`, inline: true },
      { name: '<a:chart_animated_purple:1502894826939748363>  Total Score', value: `**${data.newTotal}** pts`, inline: true },
      {
        name: '<a:fire_animated:1502888273469767821>  Streak',
        value: data.streak >= 5
          ? `<a:ultra_fire:1502888540055404595> **${data.streak}x** ON FIRE`
          : data.streak >= 3
            ? `<a:fire_animated:1502888273469767821> **${data.streak}x** streak`
            : data.streak > 0
              ? `**${data.streak}x**`
              : '`Broken`',
        inline: true,
      },
      { name: '⏱️  Speed', value: `**${timeSec}s** — ${speedRating}`, inline: true },
    )

  if (data.leveledUp) {
    embed.addFields({
      name: '<a:levelup_animated:1502889866365763616>  Level Up!',
      value: `🎉 You reached **Level ${data.newLevel}**!`,
      inline: false,
    })
  }

  if (data.newAchievements?.length) {
    embed.addFields({
      name: '<a:trophy_animated:1502890030538948729>  Achievement Unlocked!',
      value: data.newAchievements.map(a => `${a.emoji}  **${a.name}**`).join('\n'),
      inline: false,
    })
  }

  embed
    .setFooter({ text: `Next question in 3s...` })
    .setTimestamp()

  return embed
}

export const buildTimeout = (correctAnswer) => {
  return new EmbedBuilder()
    .setColor(0xFF6B00)
    .setTitle('<a:timer_animated:1502890625874526362>  Time\'s Up!')
    .setDescription([
      '> ⌛ You ran out of time for this question.',
      '',
      `The correct answer was **${correctAnswer}**`,
    ].join('\n'))
    .setFooter({ text: 'Next question loading in 3s...' })
    .setTimestamp()
}

export const buildSummary = (data) => {
  const accuracy = Math.round((data.totalCorrect / data.totalQuestions) * 100)
  const resultLines = data.results.map((r, i) =>
    `**Q${i + 1}** ${r.correct ? '<a:check_animated_green:1502887277536215223>' : r.timedOut ? '<a:timer_animated:1502890625874526362>' : '<a:x_animated_red:1502888069299441756>'} ${r.timedOut ? 'Timed out' : r.correct ? `+${r.scoreDelta} pts` : 'Wrong'} — *${r.correctAnswer}*`
  ).join('\n')

  return new EmbedBuilder()
    .setColor(data.totalCorrect >= 4 ? colors.correct : data.totalCorrect >= 2 ? colors.primary : colors.wrong)
    .setTitle(`<a:trophy_animated:1502890030538948729> Game Over — ${data.totalCorrect}/${data.totalQuestions} Correct`)
    .setDescription(resultLines)
    .addFields(
      { name: '<a:gem_purple_animated:1502893269846331492> Points Earned', value: `+${data.totalScore} pts`, inline: true },
      { name: '<a:chart_animated_purple:1502894826939748363> Accuracy', value: `${accuracy}%`, inline: true },
      { name: '<a:fire_animated:1502888273469767821> Streak', value: `${data.streak}`, inline: true },
      { name: '<a:crown_animated_gold:1502888744032665610> Total Score', value: `${data.newTotal} pts`, inline: true },
    )
    .setFooter({ text: `Level ${data.level}` })
    .setTimestamp()
}