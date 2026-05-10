import { SlashCommandBuilder } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { getPlayer } from '../../db/players.js'
import { colors } from '../../config/colors.js'

export const data = new SlashCommandBuilder()
  .setName('streak')
  .setDescription('Check your current answer streak and best streak')
  .addUserOption(opt =>
    opt.setName('user')
      .setDescription('Check another player\'s streak (optional)')
  )

export const execute = async (interaction) => {
  const target = interaction.options.getUser('user') || interaction.user
  const player = getPlayer(target.id, target.username)

  const streakEmoji = player.streak >= 10
    ? '<a:ultra_fire:1502888540055404595>'
    : player.streak >= 3
      ? '<a:fire_animated:1502888273469767821>'
      : '💤'

  const streakLabel = player.streak >= 10
    ? 'ON FIRE 🔥'
    : player.streak >= 5
      ? 'Heating Up!'
      : player.streak >= 3
        ? 'On a Roll!'
        : player.streak > 0
          ? 'Building...'
          : 'No active streak'

  const embed = new EmbedBuilder()
    .setColor(player.streak >= 5 ? colors.wrong : player.streak >= 1 ? colors.gold : colors.neutral)
    .setTitle(`<a:fire_animated:1502888273469767821>  ${target.username}'s Streak`)
    .setDescription(`${streakEmoji}  **${streakLabel}**`)
    .addFields(
      {
        name: '<a:fire_animated:1502888273469767821>  Current Streak',
        value: `**${player.streak}x** consecutive correct`,
        inline: true,
      },
      {
        name: '<a:trophy_animated:1502890030538948729>  Best Ever',
        value: `**${player.best_streak}x**`,
        inline: true,
      },
      {
        name: '<a:calendar_animated:1502891144714125522>  Daily Streak',
        value: `**${player.daily_streak}** days in a row`,
        inline: true,
      },
      {
        name: '<a:gem_purple_animated:1502893269846331492>  Streak Bonus',
        value: player.streak > 0
          ? `Currently adding **+${Math.min(30, player.streak * 2)}** bonus pts per correct answer`
          : '`Answer correctly to start earning bonus points!`',
        inline: false,
      },
    )
    .setFooter({ text: 'Streaks reset on a wrong answer or timeout.' })
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}
