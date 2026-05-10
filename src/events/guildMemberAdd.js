export const name = 'guildMemberAdd'

export const execute = async (member) => {
  try {
    await member.send('Welcome! Try /trivia play to start playing trivia!')
  } catch {
    // ignore
  }
}