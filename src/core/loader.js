import { readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const loadCommands = async (client) => {
  client.commands = new Map()
  const loadDir = async (dir) => {
    const files = readdirSync(dir)
    for (const file of files) {
      const path = join(dir, file)
      if (file.endsWith('.js')) {
        const command = await import(`file://${path}`)
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command)
        }
      } else if (statSync(path).isDirectory()) {
        await loadDir(path)
      }
    }
  }
  await loadDir(join(__dirname, '../commands'))
}

export const loadEvents = async (client) => {
  const loadDir = async (dir) => {
    const files = readdirSync(dir)
    for (const file of files) {
      const path = join(dir, file)
      if (file.endsWith('.js')) {
        const event = await import(`file://${path}`)
        if (event.name && event.execute) {
          client.on(event.name, async (...args) => {
            try {
              await event.execute(...args)
            } catch (error) {
              console.error(error)
            }
          })
        }
      } else if (statSync(path).isDirectory()) {
        await loadDir(path)
      }
    }
  }
  await loadDir(join(__dirname, '../events'))
}