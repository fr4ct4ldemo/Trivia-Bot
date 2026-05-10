import { logger } from '../utils/logger.js'
import { startScheduler } from '../scheduler/index.js'

export const name = 'clientReady'

export const execute = async (client) => {
  logger.info(`Logged in as ${client.user.tag}`)
  logger.info(`Serving ${client.guilds.cache.size} guilds`)
  await client.user.setUsername('Mr. Obvious')
  startScheduler(client)
}