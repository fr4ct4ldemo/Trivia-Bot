import cron from 'node-cron'
import { fetchQuestion } from '../api/otdb.js'
import { buildDailyChallenge, buildDailyLeaderboard } from '../embeds/daily.js'
import { db } from '../db/index.js'
import 'dotenv/config'

const categories = [9, 17, 23, 22, 21, 12, 11, 18, 10, 27, 19, 20, 24, 28]

let client

export const setClient = (c) => { client = c }

export const startDaily = () => {
  cron.schedule(process.env.DAILY_RESET_CRON || '0 8 * * *', async () => {
    const categoryId = categories[Math.floor(Math.random() * categories.length)]
    const question = await fetchQuestion(categoryId, 'medium')
    const date = new Date().toISOString().split('T')[0]
    const embed = buildDailyChallenge({ question: question.question, date, participants: 0 })
    const channel = client.channels.cache.get(process.env.DAILY_CHANNEL_ID)
    if (channel) {
      const msg = await channel.send({ embeds: [embed] })
      // add collector
    }
  })
}