import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'

export const buildAdminConfirm = (action, target) => {
  return new EmbedBuilder()
    .setColor(colors.admin)
    .setTitle('<a:shield_animated:1502894278362398780>  Admin — Confirm Action')
    .setDescription([
      `> ⚠️ You are about to perform: **${action}**`,
      `> Target: **${target}**`,
      '',
      '`Confirm using the buttons below.`',
    ].join('\n'))
    .setTimestamp()
}

export const buildAdminResult = (action, success, detail) => {
  return new EmbedBuilder()
    .setColor(success ? colors.correct : colors.wrong)
    .setTitle(`${success ? '<a:check_animated_green:1502887277536215223>' : '<a:x_animated_red:1502888069299441756>'}  Admin — ${success ? 'Success' : 'Failed'}`)
    .setDescription([
      `> **Action:** ${action}`,
      `> **Result:** ${detail}`,
    ].join('\n'))
    .setTimestamp()
}