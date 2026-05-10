import { create, get, destroy } from './session.js'
import { calcScore, calcXp } from './scoring.js'
import { generateHint } from './hints.js'
import { validateAnswer, canPlay } from './validator.js'
import { getPlayer, updateAfterGame, resetStreak } from '../db/players.js'
import { logGame } from '../db/history.js'
import { checkAndUnlock } from '../db/achievements.js'
import { set } from '../utils/cooldown.js'
import { startTimer, clearTimer } from '../utils/timer.js'
import { buildQuestion } from '../embeds/question.js'
import { buildResult, buildTimeout } from '../embeds/result.js'
import { buildSessionLeaderboard } from '../embeds/leaderboard.js'
import { fetchBatch } from '../api/otdb.js'
import { DEFAULT_TIME, COOLDOWN_TRIVIA, BASE_POINTS, QUESTIONS_PER_GAME } from '../config/constants.js'

export const startGame = async (interaction, options) => {
  const userId = interaction.user.id
  if (!canPlay(userId)) return interaction.reply({ content: 'Cooldown or banned.', ephemeral: true })
  if (!interaction.deferred && !interaction.replied) await interaction.deferReply()

  const questions = await fetchBatch(QUESTIONS_PER_GAME, options.category, options.difficulty)
  const player = getPlayer(userId, interaction.user.username)

  const session = {
    userId,
    interaction,
    questions,           // all 5 questions
    questionIndex: 0,    // current question number (0-based)
    timeLimit: options.time || DEFAULT_TIME,
    streak: player.streak,
    totalScore: 0,
    totalCorrect: 0,
    results: [],         // store per-question results for summary
    timerId: null,
  }
  create(userId, session)
  await sendQuestion(userId)
}

const sendQuestion = async (userId) => {
  const session = get(userId)
  if (!session) return

  const { interaction, questions, questionIndex, streak, timeLimit } = session
  const question = questions[questionIndex]

  const embed = buildQuestion({
    ...question,
    streak,
    timeLimit,
    remaining: timeLimit,   // <-- ADD THIS
    questionNumber: questionIndex + 1,
    totalQuestions: QUESTIONS_PER_GAME,
  })

  const buttons = question.choices.map((choice, i) => ({
    type: 2, style: 2, label: String.fromCharCode(65 + i), custom_id: `answer_${i}`,
  }))
  buttons.push({ type: 2, style: 4, label: 'Use Hint (-5pts)', custom_id: 'hint' })

  await interaction.editReply({ embeds: [embed], components: [{ type: 1, components: buttons }] })

  const timerId = startTimer({
    seconds: timeLimit,
    onTick: async (remaining) => {
      const currentSession = get(userId)
      if (!currentSession) return
      const currentQuestion = currentSession.questions[currentSession.questionIndex]
      const updatedEmbed = buildQuestion({
        ...currentQuestion,
        streak: currentSession.streak,
        timeLimit,
        remaining,           // <-- draining value
        questionNumber: currentSession.questionIndex + 1,
        totalQuestions: QUESTIONS_PER_GAME,
      })
      // rebuild buttons (still enabled)
      const activeButtons = currentQuestion.choices.map((_, i) => ({
        type: 2, style: 2, label: String.fromCharCode(65 + i), custom_id: `answer_${i}`,
      }))
      activeButtons.push({ type: 2, style: 4, label: 'Use Hint (-5pts)', custom_id: 'hint' })
      try {
        await currentSession.interaction.editReply({
          embeds: [updatedEmbed],
          components: [{ type: 1, components: activeButtons }],
        })
      } catch (_) {}
    },
    onExpire: () => expireGame(userId),
  })

  // Update timerId on session
  const updated = get(userId)
  if (updated) updated.timerId = timerId
}

export const submitAnswer = async (interaction, answerIndex) => {
  const userId = interaction.user.id
  const session = get(userId)
  if (!session) return

  if (session.timerId) clearTimer(session.timerId)

  const question = session.questions[session.questionIndex]
  const correct = validateAnswer(question.choices[answerIndex], question.correct)
  const timeTaken = Date.now() - (session.startTime || Date.now())
  const scoreDelta = correct
    ? calcScore(BASE_POINTS, question.difficulty, timeTaken, session.timeLimit, session.streak)
    : 0
  const xpGained = correct ? calcXp(scoreDelta, question.difficulty) : 0
  const newStreak = correct ? session.streak + 1 : 0

  updateAfterGame(userId, { correct: correct ? 1 : 0, scoreDelta, streak: newStreak, timeTaken, category: question.category, difficulty: question.difficulty })
  logGame({ userId, category: question.category, difficulty: question.difficulty, correct: correct ? 1 : 0, scoreDelta, streak: session.streak, timeTaken })
  const player = getPlayer(userId)
  const newAchievements = checkAndUnlock(userId, player, { timeTaken })

  session.totalScore += scoreDelta
  session.totalCorrect += correct ? 1 : 0
  session.streak = newStreak
  session.results.push({ correct, scoreDelta, question: question.question, correctAnswer: question.correct })

  const resultEmbed = buildResult({
    correct,
    correctAnswer: question.correct,
    scoreDelta,
    newTotal: player.score,
    streak: newStreak,
    timeTaken,
    xpGained,
    leveledUp: false,
    newLevel: player.level,
    newAchievements,
    questionNumber: session.questionIndex + 1,
    totalQuestions: QUESTIONS_PER_GAME,
  })

  const disabledButtons = question.choices.map((_, i) => ({
    type: 2, style: 2, label: String.fromCharCode(65 + i), custom_id: `answer_${i}`, disabled: true,
  }))
  disabledButtons.push({ type: 2, style: 4, label: 'Use Hint (-5pts)', custom_id: 'hint', disabled: true })

  await interaction.update({ embeds: [resultEmbed], components: [{ type: 1, components: disabledButtons }] })

  session.questionIndex++

  if (session.questionIndex >= QUESTIONS_PER_GAME) {
    await finishGame(userId, player)
  } else {
    await new Promise(resolve => setTimeout(resolve, 3000))
    const stillAlive = get(userId)  // guard after wait
    if (!stillAlive) return
    await sendQuestion(userId)
  }
}

export const expireGame = async (userId) => {
  const session = get(userId)
  if (!session) return  // already destroyed, do nothing

  const question = session.questions[session.questionIndex]

  // Disable all buttons
  const disabledButtons = question.choices.map((_, i) => ({
    type: 2, style: 2, label: String.fromCharCode(65 + i), custom_id: `answer_${i}`, disabled: true,
  }))
  disabledButtons.push({ type: 2, style: 4, label: 'Use Hint (-5pts)', custom_id: 'hint', disabled: true })

  const timeoutEmbed = buildTimeout(question.correct)
  try {
    await session.interaction.editReply({ embeds: [timeoutEmbed], components: [{ type: 1, components: disabledButtons }] })
  } catch (_) {}

  // Record timed-out question in results
  session.results.push({
    correct: false,
    scoreDelta: 0,
    question: question.question,
    correctAnswer: question.correct,
    timedOut: true,
  })
  session.questionIndex++
  resetStreak(userId)
  session.streak = 0

  await new Promise(resolve => setTimeout(resolve, 3000))

  // Check again — session may have been destroyed during the 3s wait
  const stillAlive = get(userId)
  if (!stillAlive) return

  if (session.questionIndex >= QUESTIONS_PER_GAME) {
    // Last question timed out — go straight to finish
    const player = getPlayer(userId)
    await finishGame(userId, player)
  } else {
    await sendQuestion(userId)
  }
}

const finishGame = async (userId, player) => {
  const session = get(userId)
  if (!session) return

  // Destroy session FIRST so any button clicks after this are ignored
  destroy(userId)
  set(userId, 'trivia', COOLDOWN_TRIVIA * 1000)

  const leaderboardEmbed = buildSessionLeaderboard(session.results, player.username)

  try {
    await session.interaction.editReply({ embeds: [leaderboardEmbed], components: [] })
  } catch (_) {}
}

export const useHint = async (interaction) => {
  const userId = interaction.user.id
  const session = get(userId)
  if (!session) return
  const question = session.questions[session.questionIndex]
  const { hint, cost } = generateHint(question.correct, question.category)
  session.scoreDelta = (session.scoreDelta || 0) - cost
  await interaction.reply({ content: hint, ephemeral: true })
}