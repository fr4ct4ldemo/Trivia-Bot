import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'

export const buildBracket = (bracket) => {
  return new EmbedBuilder()
    .setColor(colors.tournament)
    .setTitle('<a:bracket_animated:1502892933563682907>  Tournament Bracket')
    .setDescription(bracket || '`Bracket not yet generated.`')
    .setTimestamp()
}

export const buildMatchStart = (data) => {
  return new EmbedBuilder()
    .setColor(colors.tournament)
    .setTitle(`<a:swords_animated:1502891491998302208>  Round ${data.round} — Match Start`)
    .setDescription([
      `> ⚔️  **${data.player1}**  vs  **${data.player2}**`,
      '',
      '`Get ready — first question incoming!`',
    ].join('\n'))
    .setTimestamp()
}

export const buildMatchResult = (data) => {
  return new EmbedBuilder()
    .setColor(colors.tournament)
    .setTitle('<a:trophy_animated:1502890030538948729>  Match Result')
    .setDescription(`<a:crown_animated_gold:1502888744032665610>  **${data.winner}** advances!`)
    .addFields(
      { name: '❌  Eliminated', value: `**${data.loser}**`, inline: true },
      { name: '<a:chart_animated_purple:1502894826939748363>  Score', value: `**${data.score}**`, inline: true },
    )
    .setTimestamp()
}

export const buildTournamentWinner = (player) => {
  return new EmbedBuilder()
    .setColor(colors.gold)
    .setTitle('<a:crown_animated_gold:1502888744032665610>  Tournament Champion!')
    .setDescription([
      `> <a:trophy_animated:1502890030538948729>  **${player}** is the undisputed champion!`,
      '',
      '🎉 Congratulations on dominating the entire bracket!',
    ].join('\n'))
    .setTimestamp()
}

/**
 * Build tournament lobby embed
 * @param {object} data - Lobby data
 * @returns {EmbedBuilder}
 */
export const buildLobbyEmbed = ({ host, players, maxPlayers, status = 'waiting' }) => {
  const playerList = players.map(p => `<@${p.userId}> — **${p.username}**`).join('\n')

  const statusText = status === 'started'
    ? '🎮 Tournament Started'
    : status === 'cancelled'
      ? '❌ Tournament Cancelled'
      : '⏳ Waiting for Players'

  const embed = new EmbedBuilder()
    .setColor(colors.tournament)
    .setTitle('🏆 Tournament Lobby')
    .setDescription(`**Status:** ${statusText}`)
    .addFields(
      {
        name: '👑 Host',
        value: `<@${host}>`,
        inline: false,
      },
      {
        name: `👥 Players (${players.length}/${maxPlayers})`,
        value: playerList || '`No players yet`',
        inline: false,
      }
    )
    .setFooter({ text: status === 'waiting' ? 'Tournament starts when host clicks button' : 'Tournament in progress' })
    .setTimestamp()

  return embed
}

/**
 * Build tournament results embed
 * @param {object} data - Results data
 * @returns {EmbedBuilder}
 */
export const buildTournamentResultsEmbed = ({ rankedPlayers }) => {
  const medals = ['🥇', '🥈', '🥉']
  const resultLines = rankedPlayers.map((player, i) => {
    const medal = medals[i] || '  '
    const accuracy = Math.round((player.correct / 5) * 100)
    return `${medal} **#${i + 1}** — <@${player.userId}> **${player.score}** pts (${player.correct}/5 correct — ${accuracy}%)`
  }).join('\n')

  const embed = new EmbedBuilder()
    .setColor(colors.tournament)
    .setTitle('🏆 Tournament Results')
    .setDescription(resultLines)
    .setFooter({ text: `${rankedPlayers.length} players competed` })
    .setTimestamp()

  return embed
}

/**
 * Build tournament cancelled embed
 * @returns {EmbedBuilder}
 */
export const buildTournamentCancelledEmbed = () => {
  return new EmbedBuilder()
    .setColor(colors.wrong)
    .setTitle('❌ Tournament Cancelled')
    .setDescription('The tournament was cancelled due to inactivity (5-minute timeout).')
    .setTimestamp()
}
