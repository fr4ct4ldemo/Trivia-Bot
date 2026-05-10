import { startDaily, setClient as setDailyClient } from './daily.js'
import { startWeekly, setClient as setWeeklyClient } from './weekly.js'
import 'dotenv/config'

export const startScheduler = (client) => {
  setDailyClient(client)
  setWeeklyClient(client)
  if (process.env.DAILY_CHANNEL_ID) startDaily()
  if (process.env.WEEKLY_RESET_CRON) startWeekly()
}