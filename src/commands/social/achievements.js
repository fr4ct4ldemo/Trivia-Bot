import { SlashCommandBuilder } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { getUnlocked } from '../../db/achievements.js'
import { achievements } from '../../config/achievements.js'
import { colors } from '../../config/colors.js'

export const data = new SlashCommandBuilder()
  .setName('achievements')
  .setDescription('Browse your unlocked achievements and what remains to unlock')
  .addUserOption(opt =>
    opt.setName('user')
      .setDescription('View another player\'s achievements (optional)')
  )

export const execute = async (interaction) => {
  const target = interaction.options.getUser('user') || interaction.user
  const unlocked = getUnlocked(target.id)

  const unlockedList = achievements.filter(a => unlocked.includes(a.id))
  const lockedList = achievements.filter(a => !unlocked.includes(a.id))

  const formatAch = (a, done) =>
    `${done ? '<a:trophy_animated:1502890030538948729>' : '🔒'}  **${a.name}** — ${a.description}  *(+${a.reward} pts)*`

  const embed = new EmbedBuilder()
    .setColor(colors.gold)
    .setTitle(`<a:trophy_animated:1502890030538948729>  ${target.username}'s Achievements`)
    .setDescription([
      `**${unlockedList.length} / ${achievements.length}** unlocked`,
      '',
      '──────────────────────',
    ].join('\n'))
    .addFields(
      {
        name: `<a:check_animated_green:1502887277536215223>  Unlocked (${unlockedList.length})`,
        value: unlockedList.length
          ? unlockedList.map(a => formatAch(a, true)).join('\n')
          : '`None yet — start playing!`',
        inline: false,
      },
      {
        name: `🔒  Locked (${lockedList.length})`,
        value: lockedList.length
          ? lockedList.map(a => formatAch(a, false)).join('\n')
          : '`All achievements unlocked! 🎉`',
        inline: false,
      },
    )
    .setFooter({ text: 'Play more games to unlock achievements!' })
    .setTimestamp()

  await interaction.reply({ embeds: [embed] })
}
