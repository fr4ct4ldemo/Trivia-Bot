import 'dotenv/config'
import { client } from '../src/core/client.js'
import { loadCommands } from '../src/core/loader.js'
import { registerCommands } from '../src/core/registry.js'

const deploy = async () => {
  await loadCommands(client)
  await registerCommands(client)
  console.log('Commands registered')
}

deploy()