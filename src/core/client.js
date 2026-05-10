import { Client, GatewayIntentBits } from 'discord.js'
import 'dotenv/config'
import { loadCommands, loadEvents } from './loader.js'
import { registerCommands } from './registry.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
})

await loadCommands(client)
await loadEvents(client)
await registerCommands(client)

client.login(process.env.DISCORD_TOKEN)

export { client }