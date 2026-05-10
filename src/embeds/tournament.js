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
