import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import { setBanned, unban } from '../../db/players.js'
import { buildAdminResult } from '../../embeds/admin.js'
import { db } from '../../db/index.js'

export const data = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Admin commands')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('ban')
      .setDescription('Ban a player from using the bot')
      .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('Reason for ban'))
  )
  .addSubcommand(sub =>
    sub.setName('unban')
      .setDescription('Unban a player')
      .addUserOption(opt => opt.setName('user').setDescription('User to unban').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('reset')
      .setDescription('Reset a player\'s score and stats')
      .addUserOption(opt => opt.setName('user').setDescription('User to reset').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('addquestion')
      .setDescription('Add a custom question to the pool')
      .addStringOption(opt => opt.setName('question').setDescription('The question').setRequired(true))
      .addStringOption(opt => opt.setName('correct').setDescription('Correct answer').setRequired(true))
      .addStringOption(opt => opt.setName('wrong1').setDescription('Wrong answer 1').setRequired(true))
      .addStringOption(opt => opt.setName('wrong2').setDescription('Wrong answer 2').setRequired(true))
      .addStringOption(opt => opt.setName('wrong3').setDescription('Wrong answer 3').setRequired(true))
      .addStringOption(opt => opt.setName('category').setDescription('Category name').setRequired(true))
      .addStringOption(opt =>
        opt.setName('difficulty').setDescription('Difficulty').setRequired(true)
          .addChoices({ name: 'Easy', value: 'easy' }, { name: 'Medium', value: 'medium' }, { name: 'Hard', value: 'hard' })
      )
  )
  .addSubcommand(sub =>
    sub.setName('removequestion')
      .setDescription('Remove a custom question by ID')
      .addIntegerOption(opt => opt.setName('id').setDescription('Question ID').setRequired(true))
  )
  .addSubcommand(sub =>
    sub.setName('listquestions')
      .setDescription('List all custom questions for this server')
  )
  .addSubcommand(sub =>
    sub.setName('announce')
      .setDescription('Send an announcement via the bot')
      .addStringOption(opt => opt.setName('message').setDescription('Message to announce').setRequired(true))
      .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send to (defaults to current)'))
  )

export const execute = async (interaction) => {
  const sub = interaction.options.getSubcommand()

  if (sub === 'ban') {
    const target = interaction.options.getUser('user')
    const reason = interaction.options.getString('reason') || 'No reason provided'
    setBanned(target.id, reason, interaction.user.id)
    await interaction.reply({ embeds: [buildAdminResult('Ban', true, `${target.username} — ${reason}`)], ephemeral: true })

  } else if (sub === 'unban') {
    const target = interaction.options.getUser('user')
    unban(target.id)
    await interaction.reply({ embeds: [buildAdminResult('Unban', true, target.username)], ephemeral: true })

  } else if (sub === 'reset') {
    const target = interaction.options.getUser('user')
    try {
      db.prepare(`UPDATE players SET score=0, xp=0, level=1, streak=0, best_streak=0,
        games_played=0, correct=0, wrong=0, daily_streak=0 WHERE user_id=?`).run(target.id)
      await interaction.reply({ embeds: [buildAdminResult('Reset', true, target.username)], ephemeral: true })
    } catch (e) {
      await interaction.reply({ embeds: [buildAdminResult('Reset', false, e.message)], ephemeral: true })
    }

  } else if (sub === 'addquestion') {
    const question = interaction.options.getString('question')
    const correct = interaction.options.getString('correct')
    const wrong1 = interaction.options.getString('wrong1')
    const wrong2 = interaction.options.getString('wrong2')
    const wrong3 = interaction.options.getString('wrong3')
    const category = interaction.options.getString('category')
    const difficulty = interaction.options.getString('difficulty')
    try {
      db.prepare(`INSERT INTO custom_questions (guild_id, question, correct, wrong1, wrong2, wrong3, category, difficulty, added_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(interaction.guildId, question, correct, wrong1, wrong2, wrong3, category, difficulty, interaction.user.id)
      await interaction.reply({ embeds: [buildAdminResult('Add Question', true, `"${question}"`)], ephemeral: true })
    } catch (e) {
      await interaction.reply({ embeds: [buildAdminResult('Add Question', false, e.message)], ephemeral: true })
    }

  } else if (sub === 'removequestion') {
    const id = interaction.options.getInteger('id')
    const result = db.prepare('DELETE FROM custom_questions WHERE id = ? AND guild_id = ?').run(id, interaction.guildId)
    const success = result.changes > 0
    await interaction.reply({ embeds: [buildAdminResult('Remove Question', success, success ? `ID ${id} removed` : `ID ${id} not found`)], ephemeral: true })

  } else if (sub === 'listquestions') {
    const rows = db.prepare('SELECT id, question, difficulty, category FROM custom_questions WHERE guild_id = ?').all(interaction.guildId)
    const embed = new (require('discord.js').EmbedBuilder)()
      .setColor(colors.admin)
      .setTitle('<a:shield_animated:1502894278362398780>  Custom Questions')
      .setDescription(rows.length
        ? rows.map(r => `\`#${r.id}\`  **${r.question}**  *(${r.difficulty} — ${r.category})*`).join('\n')
        : '`No custom questions added yet.`'
      )
      .setFooter({ text: `${rows.length} question(s) total` })
      .setTimestamp()
    await interaction.reply({ embeds: [embed], ephemeral: true })

  } else if (sub === 'announce') {
    const message = interaction.options.getString('message')
    const channel = interaction.options.getChannel('channel') || interaction.channel
    const embed = new (require('discord.js').EmbedBuilder)()
      .setColor(colors.primary)
      .setTitle('📢  Announcement')
      .setDescription(message)
      .setFooter({ text: `From: ${interaction.user.username}` })
      .setTimestamp()
    await channel.send({ embeds: [embed] })
    await interaction.reply({ content: `<a:check_animated_green:1502887277536215223> Announcement sent to ${channel}!`, ephemeral: true })
  }
}
