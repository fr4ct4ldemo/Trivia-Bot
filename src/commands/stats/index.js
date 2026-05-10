import { SlashCommandBuilder } from 'discord.js'
import { getPlayer, getCategoryBreakdown } from '../../db/players.js'
import { getRecent } from '../../db/history.js'
import { getUnlocked } from '../../db/achievements.js'
import { buildProfile } from '../../embeds/profile.js'
import { buildHistory, buildStats } from '../../embeds/stats.js'

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('View player stats')
  .addSubcommand(sub => sub.setName('me').setDescription('Your stats'))
  .addSubcommand(sub =>
    sub.setName('user')
      .setDescription('User stats')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
  )
  .addSubcommand(sub => sub.setName('history').setDescription('Your recent games'))
  .addSubcommand(sub => sub.setName('breakdown').setDescription('Your category breakdown'))

export const execute = async (interaction) => {
  const sub = interaction.options.getSubcommand()
  const userId = sub === 'user' ? interaction.options.getUser('user').id : interaction.user.id
  const player = getPlayer(userId)
  if (sub === 'me' || sub === 'user') {
    const achievements = getUnlocked(userId)
    const recentHistory = getRecent(userId, 3)
    const categoryBreakdown = getCategoryBreakdown(userId)
    const rank = 1 // placeholder
    const embed = buildProfile(player, { achievements, recentHistory, categoryBreakdown, rank })
    await interaction.reply({ embeds: [embed] })
  } else if (sub === 'history') {
    const entries = getRecent(userId, 10)
    const embed = buildHistory(entries)
    await interaction.reply({ embeds: [embed] })
  } else if (sub === 'breakdown') {
    const breakdown = getCategoryBreakdown(userId)
    const embed = buildStats(player, breakdown)
    await interaction.reply({ embeds: [embed] })
  }
}