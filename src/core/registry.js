import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import 'dotenv/config'

export const registerCommands = async (client) => {
  const commands = []
  for (const command of client.commands.values()) {
    commands.push(command.data.toJSON())
  }
  const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN)
  try {
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      )
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      )
    }
  } catch (error) {
    console.error(error)
  }
}