import { SlashCommandBuilder } from 'discord.js'
import { getLeaderboard } from '../../db/players.js'
import { buildLeaderboard } from '../../embeds/leaderboard.js'

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View leaderboard')
  .addStringOption(opt =>
    opt.setName('scope')
      .setDescription('Scope')
      .addChoices({ name: 'Server', value: 'server' }, { name: 'Global', value: 'global' })
  )
  .addIntegerOption(opt =>
    opt.setName('page')
      .setDescription('Page')
      .setMinValue(1)
  )

export const execute = async (interaction) => {
  const scope = interaction.options.getString('scope') || 'server'
  const page = interaction.options.getInteger('page') || 1
  const limit = 10
  const rows = getLeaderboard(limit)
  const totalPages = 1 // placeholder
  const embed = buildLeaderboard(rows, { page, totalPages, scope })
  await interaction.reply({ embeds: [embed] })
}