import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'

export const buildAchievementUnlock = (achievement, player) => {
  return new EmbedBuilder()
    .setColor(colors.gold)
    .setTitle('<a:trophy_animated:1502890030538948729>  Achievement Unlocked!')
    .setDescription([
      `## ${achievement.emoji ?? '🏅'}  ${achievement.name}`,
      `> ${achievement.description}`,
    ].join('\n'))
    .addFields(
      { name: '<a:gem_purple_animated:1502893269846331492>  Reward', value: `**+${achievement.reward}** pts`, inline: true },
      { name: '<a:trophy_animated:1502890030538948729>  Progress', value: `**${player.achievements.length + 1} / 15** unlocked`, inline: true },
    )
    .setFooter({ text: 'Keep playing to unlock more achievements!' })
    .setTimestamp()
}
