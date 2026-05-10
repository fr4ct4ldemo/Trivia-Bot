import { logger } from '../utils/logger.js'

export const name = 'error'

export const execute = (error) => {
  logger.error(error)
}

process.on('unhandledRejection', (reason) => {
  logger.error(reason)
})