import { SlashCommandBuilder } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { categories } from '../../config/categories.js'
import { difficulties } from '../../config/difficulties.js'
import { colors } from '../../config/colors.js'

export const data = new SlashCommandBuilder()
  .setName('categories')
  .setDescription('Browse all available trivia categories and difficulties')

export const execute = async (interaction) => {
  const categoryLines = categories.map(c =>
    `${c.emoji}  **${c.name}** — *${c.description}*`
  ).join('\n')

  const difficultyLines = Object.entries(difficulties).map(([key, d]) =>
    `\`${key}\`  ${d.label} — ${d.description}  *(×${d.multiplier} pts)*`
  ).join('\n')

  const embed = new EmbedBuilder()
    .setColor(colors.primary)
    .setTitle('<a:tag_animated_purple:1502895262442717315>  Available Categories')
    .setDescription([
      '> Pick a category when running `/trivia play` for a focused game.',
      '> Leave it blank for a random category each round!',
      '',
      '──────────────────────',
    ].join('\n'))
    .addFields(
      {
        name: '<a:bulb_animated_yellow:1502894016826572860>  Categories',
        value: categoryLines,
        inline: false,
      },
      {
        name: '<a:gem_purple_animated:1502893269846331492>  Difficulties',
        value: difficultyLines,
        inline: false,
      },
    )
    .setFooter({ text: `${categories.length} categories available  •  Use /trivia play to start!` })
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}
