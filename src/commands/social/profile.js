import { SlashCommandBuilder } from 'discord.js'
import { getPlayer, getCategoryBreakdown } from '../../db/players.js'
import { getRecent } from '../../db/history.js'
import { getUnlocked } from '../../db/achievements.js'
import { buildProfile } from '../../embeds/profile.js'

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your full profile card or another player\'s')
  .addUserOption(opt =>
    opt.setName('user')
      .setDescription('Player to view (optional, defaults to yourself)')
  )

export const execute = async (interaction) => {
  const target = interaction.options.getUser('user') || interaction.user
  const player = getPlayer(target.id, target.username)
  const achievements = getUnlocked(target.id)
  const recentHistory = getRecent(target.id, 3)
  const categoryBreakdown = getCategoryBreakdown(target.id)
  const rank = 1 // placeholder until ranked query is implemented

  const embed = buildProfile(player, { achievements, recentHistory, categoryBreakdown, rank })
  await interaction.reply({ embeds: [embed] })
}
