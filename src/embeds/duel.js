import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'

export const buildDuelChallenge = (data) => {
  return new EmbedBuilder()
    .setColor(colors.duel)
    .setTitle('<a:swords_animated:1502891491998302208>  Duel Challenge!')
    .setDescription([
      `> ⚔️  **${data.challenger}** is challenging **${data.opponent}** to a trivia duel!`,
      '',
      '`Accept or decline using the buttons below.`',
    ].join('\n'))
    .addFields(
      { name: '🔄  Rounds', value: `**${data.rounds}**`, inline: true },
      { name: '<a:timer_animated:1502890625874526362>  Time Per Question', value: `**${data.timeLimit}s**`, inline: true },
      { name: '<a:gem_purple_animated:1502893269846331492>  Stakes', value: 'Ranking points on the line!', inline: true },
    )
    .setFooter({ text: 'Duel expires in 60 seconds if not accepted.' })
    .setTimestamp()
}

export const buildDuelRound = (data) => {
  return new EmbedBuilder()
    .setColor(colors.duel)
    .setTitle(`<a:swords_animated:1502891491998302208>  Round ${data.round} of ${data.totalRounds}`)
    .setDescription(`**${data.scores[0]}** vs **${data.scores[1]}**`)
    .setFooter({ text: `Round ${data.round} / ${data.totalRounds}` })
    .setTimestamp()
}

export const buildDuelResult = (data) => {
  return new EmbedBuilder()
    .setColor(colors.duel)
    .setTitle('<a:trophy_animated:1502890030538948729>  Duel Over!')
    .setDescription(`<a:crown_animated_gold:1502888744032665610>  **${data.winner}** wins the duel!`)
    .addFields(
      { name: '🔄  Rounds Played', value: `**${data.rounds}**`, inline: true },
      { name: '<a:chart_animated_purple:1502894826939748363>  Final Score', value: `**${data.scores.join(' — ')}**`, inline: true },
    )
    .setTimestamp()
}
