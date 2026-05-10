import { SlashCommandBuilder } from 'discord.js'
import { buildHelp } from '../../embeds/help.js'

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Help')

export const execute = async (interaction) => {
  const embed = buildHelp()
  await interaction.reply({ embeds: [embed] })
}