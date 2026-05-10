import { BASE_POINTS, STREAK_BONUS_PER_LEVEL, MAX_STREAK_BONUS } from '../config/constants.js'
import { difficulties } from '../config/difficulties.js'

export const calcScore = (base, difficulty, timeTaken, timeLimit, streak) => {
  const mult = difficulties[difficulty].multiplier
  const streakBonus = calcStreakBonus(streak)
  const timeDecay = Math.floor(timeTaken / 2000)
  return Math.max(0, base * mult + streakBonus - timeDecay)
}

export const calcStreakBonus = (streak) => {
  return Math.min(MAX_STREAK_BONUS, streak * STREAK_BONUS_PER_LEVEL)
}

export const calcXp = (pointsEarned, difficulty) => {
  const mult = difficulties[difficulty].multiplier
  return Math.floor(pointsEarned / mult)
}