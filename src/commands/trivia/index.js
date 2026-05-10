import { SlashCommandBuilder } from 'discord.js'
import { startGame } from '../../game/engine.js'
import { categories } from '../../config/categories.js'
import { difficulties } from '../../config/difficulties.js'

export const data = new SlashCommandBuilder()
  .setName('trivia')
  .setDescription('Play trivia games')
  .addSubcommand(sub =>
    sub.setName('play')
      .setDescription('Start a solo trivia game')
      .addStringOption(opt =>
        opt.setName('category')
          .setDescription('Category')
          .addChoices(...categories.map(c => ({ name: c.name, value: c.id.toString() })))
      )
      .addStringOption(opt =>
        opt.setName('difficulty')
          .setDescription('Difficulty')
          .addChoices(...Object.entries(difficulties).map(([k, v]) => ({ name: v.label, value: k })))
      )
      .addIntegerOption(opt =>
        opt.setName('time')
          .setDescription('Time limit in seconds')
          .setMinValue(10)
          .setMaxValue(30)
      )
  )
  .addSubcommand(sub =>
    sub.setName('duel')
      .setDescription('Challenge another user to a duel')
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('User to duel')
          .setRequired(true)
      )
      .addIntegerOption(opt =>
        opt.setName('rounds')
          .setDescription('Number of rounds')
          .setMinValue(1)
          .setMaxValue(10)
      )
      .addStringOption(opt =>
        opt.setName('difficulty')
          .setDescription('Difficulty')
          .addChoices(...Object.entries(difficulties).map(([k, v]) => ({ name: v.label, value: k })))
      )
  )
  .addSubcommand(sub =>
    sub.setName('tournament')
      .setDescription('Start or join a tournament')
  )

export const execute = async (interaction) => {
  const sub = interaction.options.getSubcommand()
  if (sub === 'play') {
    const category = parseInt(interaction.options.getString('category') || categories[Math.floor(Math.random() * categories.length)].id)
    const difficulty = interaction.options.getString('difficulty') || 'medium'
    const time = interaction.options.getInteger('time') || 20
    await startGame(interaction, { category, difficulty, time })
  } else if (sub === 'duel') {
    await interaction.reply({ content: 'Duel mode is not implemented yet.', ephemeral: true })
  } else if (sub === 'tournament') {
    await interaction.reply({ content: 'Tournament mode is not implemented yet.', ephemeral: true })
  }
}