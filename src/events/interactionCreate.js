import { check, set } from '../utils/cooldown.js'
import { COOLDOWN_TRIVIA } from '../config/constants.js'
import { isBanned } from '../db/players.js'
import { submitAnswer, useHint } from '../game/engine.js'
import { submitTournamentAnswer, startTournament, joinTournament } from '../game/tournament.js'
import { logger } from '../utils/logger.js'

export const name = 'interactionCreate'

export const execute = async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command) return
    if (isBanned(interaction.user.id, interaction.guildId)) {
      return interaction.reply({ content: 'You are banned from this server.', ephemeral: true })
    }
    if (check(interaction.user.id, interaction.commandName) > 0) {
      return interaction.reply({ content: 'Cooldown.', ephemeral: true })
    }
    try {
      await command.execute(interaction)
      set(interaction.user.id, interaction.commandName, COOLDOWN_TRIVIA * 1000)
    } catch (error) {
      logger.error('Command execution error', error)
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true })
      } else {
        await interaction.editReply({ content: 'An error occurred while executing this command.', ephemeral: true })
      }
    }
  } else if (interaction.isButton()) {
    try {
      if (interaction.customId.startsWith('answer_')) {
        const index = parseInt(interaction.customId.split('_')[1])
        await submitAnswer(interaction, index)
      } else if (interaction.customId === 'hint') {
        await useHint(interaction)
      } else if (interaction.customId === 'tournament_start') {
        await startTournament(interaction.guildId, interaction)
      } else if (interaction.customId === 'tournament_join') {
        const result = await joinTournament(interaction.guildId, interaction)
        if (!result.success) {
          return interaction.reply({ content: result.reason, ephemeral: true })
        }
        return interaction.reply({ content: 'You joined the tournament lobby!', ephemeral: true })
      } else if (interaction.customId.startsWith('tournament_answer_')) {
        const index = parseInt(interaction.customId.split('_')[2])
        await submitTournamentAnswer(interaction.guildId, interaction.user.id, index, interaction)
      }
    } catch (error) {
      logger.error('Button interaction error', error)
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred processing the button.', ephemeral: true })
      } else {
        await interaction.editReply({ content: 'An error occurred processing the button.', ephemeral: true })
      }
    }
  }
}
