import 'dotenv/config'

export const isOwner = (userId) => userId === process.env.OWNER_ID

export const isAdmin = (member) => member.permissions.has('ADMINISTRATOR')

export const requireAdmin = async (interaction) => {
  if (!isAdmin(interaction.member)) {
    await interaction.reply({ content: 'Admin required.', ephemeral: true })
    return false
  }
  return true
}