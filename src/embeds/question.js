import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'
import { difficulties } from '../config/difficulties.js'
import { getCategoryEmoji } from '../api/categories.js'
import { timerBar } from '../utils/format.js'

export const buildQuestion = (data) => {
  const difficultyColors = { easy: colors.correct, medium: colors.gold, hard: colors.wrong }

  const choiceLines = data.choices.map((choice, i) =>
    `\`${String.fromCharCode(65 + i)}\`  ${choice}`
  ).join('\n')

  const progressDots = Array.from({ length: data.totalQuestions }, (_, i) =>
    i < data.questionNumber - 1 ? '●' : i === data.questionNumber - 1 ? '◉' : '○'
  ).join(' ')

  const embed = new EmbedBuilder()
    .setColor(difficultyColors[data.difficulty] ?? colors.gold)
    .setAuthor({ name: `${getCategoryEmoji(data.categoryId)}  ${data.category}  •  ${difficultyStars[data.difficulty] ?? '⭐⭐'}  ${difficulties[data.difficulty]?.label ?? data.difficulty}` })
    .setTitle(data.isDaily ? '<a:calendar_animated:1502891144714125522>  Daily Challenge' : '❓  Trivia Question')
    .setDescription([
      `> ${data.question}`,
      '',
      '──────────────────────',
      choiceLines,
      '──────────────────────',
    ].join('\n'))
    .addFields(
      {
        name: '<a:timer_animated:1502890625874526362>  Time Remaining',
        value: timerBar(data.remaining ?? data.timeLimit, data.timeLimit),
        inline: false,
      },
      {
        name: '<a:fire_animated:1502888273469767821>  Streak',
        value: data.streak > 0 ? `${data.streak >= 5 ? '<a:ultra_fire:1502888540055404595>' : '<a:fire_animated:1502888273469767821>'} **${data.streak}x** combo` : '`None`',
        inline: true,
      },
      {
        name: '<a:gem_purple_animated:1502893269846331492>  Potential Points',
        value: `**+${10 * ({ easy: 1, medium: 2, hard: 3 }[data.difficulty] ?? 1)}** base`,
        inline: true,
      },
    )
    .setFooter({ text: `Question ${data.questionNumber} of ${data.totalQuestions}  •  ${progressDots}  •  ${data.timeLimit}s limit` })
    .setTimestamp()

  if (data.isDuel) {
    embed.addFields({ name: '<a:swords_animated:1502891491998302208>  Round', value: `Round **${data.round}** of **${data.totalRounds}**`, inline: true })
  }

  return embed
}