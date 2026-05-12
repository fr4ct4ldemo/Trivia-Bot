import { getPlayer, updateAfterGame } from '../db/players.js'
import { logGame } from '../db/history.js'
import { checkAndUnlock } from '../db/achievements.js'
import { set } from '../utils/cooldown.js'
import { startTimer, clearTimer } from '../utils/timer.js'
import { buildQuestion } from '../embeds/question.js'
import { buildResult, buildTimeout } from '../embeds/result.js'
import { buildLobbyEmbed, buildTournamentResultsEmbed } from '../embeds/tournament.js'
import { fetchBatch } from '../api/otdb.js'
import { validateAnswer } from './validator.js'
import { TOURNAMENT_MAX_PLAYERS, COOLDOWN_TRIVIA, QUESTIONS_PER_GAME, DEFAULT_TIME } from '../config/constants.js'
import { logger } from '../utils/logger.js'

/**
 * In-memory tournament state storage, keyed by guildId
 */
const tournaments = new Map()

/**
 * Create a new tournament lobby for a guild
 * @param {string} guildId - Guild ID
 * @param {Interaction} interaction - Host's interaction
 * @returns {TournamentState}
 */
export const createTournament = async (guildId, interaction) => {
  try {
    const tournament = {
      guildId,
      guild: interaction.guild,
      hostId: interaction.user.id,
      hostUsername: interaction.user.username,
      players: [
        {
          userId: interaction.user.id,
          username: interaction.user.username,
          user: interaction.user,
          score: 0,
          correct: 0,
          answers: [],
          finished: false,
        },
      ],
      status: 'lobby',
      lobbyMessageId: null,
      lobbyChannelId: interaction.channelId,
      questions: [],
      currentQuestionIndex: 0,
      createdAt: Date.now(),
      lobbyTimeout: null,
      category: 0,
      difficulty: 'medium',
    }

    tournaments.set(guildId, tournament)

    const embed = buildLobbyEmbed({
      host: tournament.hostUsername,
      players: tournament.players,
      maxPlayers: TOURNAMENT_MAX_PLAYERS,
    })

    const buttons = [
      {
        type: 2,
        style: 3, // green
        label: 'Start Tournament',
        custom_id: 'tournament_start',
      },
      {
        type: 2,
        style: 1, // blue
        label: 'Join Tournament',
        custom_id: 'tournament_join',
      },
    ]

    const reply = await interaction.reply({
      embeds: [embed],
      components: [{ type: 1, components: buttons }],
    })

    tournament.lobbyMessageId = reply.id

    // Set 5-minute timeout for lobby
    const timeout = setTimeout(() => {
      const current = tournaments.get(guildId)
      if (current && current.status === 'lobby') {
        cancelTournament(guildId)
      }
    }, 5 * 60 * 1000)

    tournament.lobbyTimeout = timeout

    logger.info(`Tournament created in guild ${guildId} by ${interaction.user.id}`)

    return tournament
  } catch (error) {
    logger.error('Failed to create tournament', error)
    throw error
  }
}

/**
 * Add a player to an existing tournament lobby
 * @param {string} guildId - Guild ID
 * @param {Interaction} interaction - Player's interaction
 * @returns {{ success: boolean, reason?: string }}
 */
export const joinTournament = async (guildId, interaction) => {
  try {
    const tournament = tournaments.get(guildId)

    if (!tournament) {
      return { success: false, reason: 'No active tournament in this server.' }
    }

    if (tournament.status !== 'lobby') {
      return { success: false, reason: 'Tournament has already started or finished.' }
    }

    // Check if player already joined
    const alreadyJoined = tournament.players.some(p => p.userId === interaction.user.id)
    if (alreadyJoined) {
      return { success: false, reason: 'You are already in the tournament.' }
    }

    // Check if tournament is full
    if (tournament.players.length >= TOURNAMENT_MAX_PLAYERS) {
      return { success: false, reason: `Tournament is full (${TOURNAMENT_MAX_PLAYERS} players).` }
    }

    tournament.players.push({
      userId: interaction.user.id,
      username: interaction.user.username,
      user: interaction.user,
      score: 0,
      correct: 0,
      answers: [],
      finished: false,
    })

    // Update lobby embed
    const embed = buildLobbyEmbed({
      host: tournament.hostUsername,
      players: tournament.players,
      maxPlayers: TOURNAMENT_MAX_PLAYERS,
    })

    const buttons = [
      {
        type: 2,
        style: 3,
        label: 'Start Tournament',
        custom_id: 'tournament_start',
        disabled: interaction.user.id !== tournament.hostId, // Disable for non-hosts
      },
      {
        type: 2,
        style: 1,
        label: 'Join Tournament',
        custom_id: 'tournament_join',
        disabled: tournament.players.length >= TOURNAMENT_MAX_PLAYERS,
      },
    ]

    const channel = interaction.guild.channels.cache.get(tournament.lobbyChannelId)
    if (channel && tournament.lobbyMessageId) {
      try {
        const message = await channel.messages.fetch(tournament.lobbyMessageId)
        await message.edit({
          embeds: [embed],
          components: [{ type: 1, components: buttons }],
        })
      } catch (error) {
        logger.error('Failed to update lobby message', error)
      }
    }

    logger.debug(`Player ${interaction.user.id} joined tournament in guild ${guildId}`)

    return { success: true }
  } catch (error) {
    logger.error('Failed to join tournament', error)
    return { success: false, reason: 'An error occurred while joining the tournament.' }
  }
}

/**
 * Start the tournament — fetch questions and begin sending to players
 * @param {string} guildId - Guild ID
 * @param {Interaction} interaction - Host's button interaction
 */
export const startTournament = async (guildId, interaction) => {
  try {
    const tournament = tournaments.get(guildId)

    if (!tournament) {
      return interaction.reply({
        content: 'Tournament not found.',
        ephemeral: true,
      })
    }

    if (tournament.status !== 'lobby') {
      return interaction.reply({
        content: 'Tournament has already started.',
        ephemeral: true,
      })
    }

    if (interaction.user.id !== tournament.hostId) {
      return interaction.reply({
        content: 'Only the host can start the tournament.',
        ephemeral: true,
      })
    }

    if (tournament.players.length < 2) {
      return interaction.reply({
        content: 'Need at least 2 players to start.',
        ephemeral: true,
      })
    }

    // Change status to prevent additional joins
    tournament.status = 'starting'

    await interaction.reply({
      content: '🏆 Tournament starting! Fetching questions...',
      ephemeral: true,
    })

    // Fetch questions for all players to answer
    try {
      tournament.questions = await fetchBatch(QUESTIONS_PER_GAME, tournament.category, tournament.difficulty)
    } catch (error) {
      logger.error('Failed to fetch tournament questions', error)
      tournament.status = 'lobby'
      return interaction.followUp({
        content: 'Failed to fetch questions. Tournament cancelled.',
        ephemeral: true,
      })
    }

    // Clear lobby timeout
    if (tournament.lobbyTimeout) {
      clearTimeout(tournament.lobbyTimeout)
      tournament.lobbyTimeout = null
    }

    // Disable buttons on lobby message
    const buttons = [
      {
        type: 2,
        style: 3,
        label: 'Start Tournament',
        custom_id: 'tournament_start',
        disabled: true,
      },
      {
        type: 2,
        style: 1,
        label: 'Join Tournament',
        custom_id: 'tournament_join',
        disabled: true,
      },
    ]

    const channel = interaction.guild.channels.cache.get(tournament.lobbyChannelId)
    if (channel && tournament.lobbyMessageId) {
      try {
        const message = await channel.messages.fetch(tournament.lobbyMessageId)
        const embed = buildLobbyEmbed({
          host: tournament.hostUsername,
          players: tournament.players,
          maxPlayers: TOURNAMENT_MAX_PLAYERS,
          status: 'started',
        })
        await message.edit({
          embeds: [embed],
          components: [{ type: 1, components: buttons }],
        })
      } catch (error) {
        logger.error('Failed to update lobby message', error)
      }
    }

    // Change status to game
    tournament.status = 'game'
    tournament.currentQuestionIndex = 0

    // Send first question to all players
    await sendTournamentQuestionToAll(guildId)

    logger.info(`Tournament started in guild ${guildId} with ${tournament.players.length} players`)
  } catch (error) {
    logger.error('Failed to start tournament', error)
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'An error occurred starting the tournament.',
        ephemeral: true,
      })
    }
  }
}

/**
 * Send current question to all active tournament players
 * @param {string} guildId - Guild ID
 */
const sendTournamentQuestionToAll = async (guildId) => {
  const tournament = tournaments.get(guildId)
  if (!tournament || tournament.status !== 'game') return

  const question = tournament.questions[tournament.currentQuestionIndex]
  if (!question) return

  const failedPlayers = []

  for (const player of tournament.players) {
    if (player.finished) continue

    // Initialize player answer array if needed
    if (!player.answers[tournament.currentQuestionIndex]) {
      player.answers[tournament.currentQuestionIndex] = {
        answered: false,
        correct: false,
        answerId: null,
        timedOut: false,
      }
    }

    try {
      const dmChannel = await player.user.createDM()

      const embed = buildQuestion({
        ...question,
        streak: 0,
        timeLimit: DEFAULT_TIME,
        remaining: DEFAULT_TIME,
        questionNumber: tournament.currentQuestionIndex + 1,
        totalQuestions: QUESTIONS_PER_GAME,
      })

      const buttons = question.choices.map((choice, i) => ({
        type: 2,
        style: 2,
        label: String.fromCharCode(65 + i),
        custom_id: `tournament_answer_${i}`,
      }))

      // Store player DM info for later updates
      if (!player.dmChannelId) {
        player.dmChannelId = dmChannel.id
      }

      player.lastMessageId = (await dmChannel.send({
        embeds: [embed],
        components: [{ type: 1, components: buttons }],
      })).id

      // Start timer for this player
      const timerId = startTimer({
        seconds: DEFAULT_TIME,
        onTick: async (remaining) => {
          try {
            const currentTournament = tournaments.get(guildId)
            if (!currentTournament || currentTournament.currentQuestionIndex !== tournament.currentQuestionIndex) return

            const currentPlayer = currentTournament.players.find(p => p.userId === player.userId)
            if (!currentPlayer || currentPlayer.finished) return

            const currentQuestion = currentTournament.questions[currentTournament.currentQuestionIndex]
            const updatedEmbed = buildQuestion({
              ...currentQuestion,
              streak: 0,
              timeLimit: DEFAULT_TIME,
              remaining,
              questionNumber: currentTournament.currentQuestionIndex + 1,
              totalQuestions: QUESTIONS_PER_GAME,
            })

            const activeButtons = currentQuestion.choices.map((_, i) => ({
              type: 2,
              style: 2,
              label: String.fromCharCode(65 + i),
              custom_id: `tournament_answer_${i}`,
            }))

            const playerDmChannel = player.user.dmChannel || (await player.user.createDM())
            if (currentPlayer.lastMessageId) {
              try {
                const msg = await playerDmChannel.messages.fetch(currentPlayer.lastMessageId)
                await msg.edit({
                  embeds: [updatedEmbed],
                  components: [{ type: 1, components: activeButtons }],
                })
              } catch (_) {}
            }
          } catch (_) {}
        },
        onExpire: () => expireTournamentQuestion(guildId, player.userId),
      })

      player.timerId = timerId
    } catch (error) {
      logger.error(`Failed to send question to player ${player.userId}`, error)
      // Player has DMs disabled, mark as finished and note it
      failedPlayers.push(player.username)
      player.finished = true
      // Mark all remaining questions as answered for this player
      for (let i = tournament.currentQuestionIndex; i < QUESTIONS_PER_GAME; i++) {
        if (!player.answers[i]) {
          player.answers[i] = {
            answered: true,
            correct: false,
            answerId: -1,
            timedOut: true,
          }
        }
      }
    }
  }

  // If any players failed to receive DMs, notify the channel
  if (failedPlayers.length > 0) {
    const channel = tournament.guild?.channels.cache.get(tournament.lobbyChannelId)
    if (channel) {
      try {
        await channel.send(
          `⚠️ Could not send questions to ${failedPlayers.join(', ')} (DMs disabled). They are marked as unable to participate.`
        )
      } catch (error) {
        logger.error('Failed to send DM disabled notification', error)
      }
    }
  }
}

/**
 * Submit a player's answer during a tournament
 * @param {string} guildId - Guild ID
 * @param {string} userId - Player user ID
 * @param {number} answerIndex - Answer choice index (0-3)
 * @param {Interaction} interaction - Button interaction
 */
export const submitTournamentAnswer = async (guildId, userId, answerIndex, interaction) => {
  try {
    const tournament = tournaments.get(guildId)
    if (!tournament || tournament.status !== 'game') return

    const player = tournament.players.find(p => p.userId === userId)
    if (!player || player.finished) return

    const question = tournament.questions[tournament.currentQuestionIndex]
    if (!question) return

    // Clear timer
    if (player.timerId) {
      clearTimer(player.timerId)
      player.timerId = null
    }

    // Mark as answered
    const answerRecord = player.answers[tournament.currentQuestionIndex]
    answerRecord.answered = true
    answerRecord.answerId = answerIndex
    answerRecord.timedOut = false

    // Check if correct
    const chosenAnswer = question.choices[answerIndex]
    const correct = validateAnswer(chosenAnswer, question.correct)
    answerRecord.correct = correct

    // Calculate score for this question
    const scoreDelta = correct ? 10 : 0
    player.score += scoreDelta
    if (correct) player.correct++

    // Build result embed
    const resultEmbed = buildResult({
      correct,
      correctAnswer: question.correct,
      scoreDelta,
      newTotal: player.score,
      streak: 0,
      timeTaken: 0,
      xpGained: 0,
      leveledUp: false,
      newLevel: 0,
      newAchievements: [],
      questionNumber: tournament.currentQuestionIndex + 1,
      totalQuestions: QUESTIONS_PER_GAME,
    })

    const disabledButtons = question.choices.map((_, i) => ({
      type: 2,
      style: 2,
      label: String.fromCharCode(65 + i),
      custom_id: `tournament_answer_${i}`,
      disabled: true,
    }))

    try {
      await interaction.update({
        embeds: [resultEmbed],
        components: [{ type: 1, components: disabledButtons }],
      })
    } catch (error) {
      logger.error('Failed to update player DM', error)
    }

    // Check if all players have answered
    const allAnswered = tournament.players.every(p => {
      if (p.finished) return true
      const answer = p.answers[tournament.currentQuestionIndex]
      return answer && answer.answered
    })

    if (allAnswered) {
      // Move to next question
      await new Promise(resolve => setTimeout(resolve, 3000))
      tournament.currentQuestionIndex++

      if (tournament.currentQuestionIndex >= QUESTIONS_PER_GAME) {
        // Finish tournament
        await finishTournament(guildId)
      } else {
        await sendTournamentQuestionToAll(guildId)
      }
    }
  } catch (error) {
    logger.error('Failed to submit tournament answer', error)
  }
}

/**
 * Handle a player's question timing out
 * @param {string} guildId - Guild ID
 * @param {string} userId - Player user ID
 */
export const expireTournamentQuestion = async (guildId, userId) => {
  try {
    const tournament = tournaments.get(guildId)
    if (!tournament || tournament.status !== 'game') return

    const player = tournament.players.find(p => p.userId === userId)
    if (!player || player.finished) return

    const question = tournament.questions[tournament.currentQuestionIndex]
    if (!question) return

    // Mark as timed out
    const answerRecord = player.answers[tournament.currentQuestionIndex]
    answerRecord.answered = true
    answerRecord.timedOut = true
    answerRecord.correct = false

    // No points for timeout
    player.score += 0

    // Send timeout message
    const timeoutEmbed = buildTimeout(question.correct)

    const disabledButtons = question.choices.map((_, i) => ({
      type: 2,
      style: 2,
      label: String.fromCharCode(65 + i),
      custom_id: `tournament_answer_${i}`,
      disabled: true,
    }))

    try {
      const playerDmChannel = player.user.dmChannel || (await player.user.createDM())
      if (player.lastMessageId) {
        try {
          const msg = await playerDmChannel.messages.fetch(player.lastMessageId)
          await msg.edit({
            embeds: [timeoutEmbed],
            components: [{ type: 1, components: disabledButtons }],
          })
        } catch (_) {}
      }
    } catch (error) {
      logger.error(`Failed to send timeout to player ${userId}`, error)
    }

    // Check if all players have answered (or timed out)
    const allFinished = tournament.players.every(p => {
      if (p.finished) return true
      const answer = p.answers[tournament.currentQuestionIndex]
      return answer && answer.answered
    })

    if (allFinished) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      tournament.currentQuestionIndex++

      if (tournament.currentQuestionIndex >= QUESTIONS_PER_GAME) {
        await finishTournament(guildId)
      } else {
        await sendTournamentQuestionToAll(guildId)
      }
    }
  } catch (error) {
    logger.error('Failed to handle tournament question timeout', error)
  }
}

/**
 * Finish tournament and compile results
 * @param {string} guildId - Guild ID
 */
const finishTournament = async (guildId) => {
  try {
    const tournament = tournaments.get(guildId)
    if (!tournament) return

    tournament.status = 'finished'

    // Sort players by score
    const rankedPlayers = [...tournament.players].sort((a, b) => b.score - a.score)

    // Record tournament history in database
    const { db } = await import('../db/index.js')
    try {
      db.prepare(`
        INSERT INTO tournament_history (guild_id, winner_id, player_count)
        VALUES (?, ?, ?)
      `).run(guildId, rankedPlayers[0]?.userId || null, tournament.players.length)
    } catch (error) {
      logger.error('Failed to record tournament history', error)
    }

    // Update database for each player
    for (const player of rankedPlayers) {
      try {
        const dbPlayer = getPlayer(player.userId, player.username)

        // Update player stats
        updateAfterGame(player.userId, {
          correct: player.correct,
          scoreDelta: player.score,
          streak: 0, // Reset streak for tournament
          timeTaken: 0,
          category: 0,
          difficulty: 'medium',
        })

        // Log tournament games
        for (let i = 0; i < player.answers.length; i++) {
          const answer = player.answers[i]
          if (answer) {
            logGame({
              userId: player.userId,
              category: 'Tournament',
              difficulty: 'tournament',
              correct: answer.correct ? 1 : 0,
              scoreDelta: answer.correct ? 10 : 0,
              streak: 0,
              timeTaken: 0,
            })
          }
        }

        // Apply cooldown
        set(player.userId, 'trivia', COOLDOWN_TRIVIA * 1000)
      } catch (error) {
        logger.error(`Failed to update player ${player.userId} after tournament`, error)
      }
    }

    // Post results in the channel
    const channel = tournament.guild?.channels.cache.get(tournament.lobbyChannelId)
    if (channel) {
      try {
        const resultsEmbed = buildTournamentResultsEmbed({
          rankedPlayers,
        })

        await channel.send({
          embeds: [resultsEmbed],
        })
      } catch (error) {
        logger.error('Failed to send tournament results', error)
      }
    }

    logger.info(`Tournament finished in guild ${guildId}. Winner: ${rankedPlayers[0]?.username}`)

    // Clean up tournament state
    tournaments.delete(guildId)
  } catch (error) {
    logger.error('Failed to finish tournament', error)
  }
}

/**
 * Get the active tournament for a guild, or null
 * @param {string} guildId - Guild ID
 * @returns {TournamentState|null}
 */
export const getTournament = (guildId) => {
  return tournaments.get(guildId) || null
}

/**
 * Cancel and clean up a tournament
 * @param {string} guildId - Guild ID
 */
export const cancelTournament = async (guildId) => {
  try {
    const tournament = tournaments.get(guildId)
    if (!tournament) return

    // Clear lobby timeout
    if (tournament.lobbyTimeout) {
      clearTimeout(tournament.lobbyTimeout)
      tournament.lobbyTimeout = null
    }

    // Update lobby message
    const channel = tournament.guild?.channels.cache.get(tournament.lobbyChannelId)
    if (channel && tournament.lobbyMessageId) {
      try {
        const message = await channel.messages.fetch(tournament.lobbyMessageId)
        const buttons = [
          {
            type: 2,
            style: 3,
            label: 'Start Tournament',
            custom_id: 'tournament_start',
            disabled: true,
          },
          {
            type: 2,
            style: 1,
            label: 'Join Tournament',
            custom_id: 'tournament_join',
            disabled: true,
          },
        ]

        const embed = buildLobbyEmbed({
          host: tournament.hostUsername,
          players: tournament.players,
          maxPlayers: TOURNAMENT_MAX_PLAYERS,
          status: 'cancelled',
        })

        await message.edit({
          embeds: [embed],
          components: [{ type: 1, components: buttons }],
        })

        await channel.send(`**🏆 Tournament Cancelled** — The tournament was cancelled after 5 minutes of inactivity.`)
      } catch (error) {
        logger.error('Failed to update cancelled tournament message', error)
      }
    }

    logger.info(`Tournament cancelled in guild ${guildId}`)

    // Clean up
    tournaments.delete(guildId)
  } catch (error) {
    logger.error('Failed to cancel tournament', error)
  }
}
