import cron from 'node-cron'
import 'dotenv/config'

let client

export const setClient = (c) => { client = c }

export const startWeekly = () => {
  cron.schedule(process.env.WEEKLY_RESET_CRON || '0 0 * * 1', async () => {
    // check players opted in, start tournament if >=4
    // else post notice
  })
}