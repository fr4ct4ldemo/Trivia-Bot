import { EmbedBuilder } from 'discord.js'
import { colors } from '../config/colors.js'

export const buildHelp = () => {
  return new EmbedBuilder()
    .setColor(colors.gold)
    .setTitle('<a:bulb_animated_yellow:1502894016826572860>  Mr. Obvious — Command Guide')
    .setDescription([
      '> Challenge your knowledge across dozens of categories.',
      '> Climb the leaderboard, unlock achievements, and duel friends!',
      '',
      '──────────────────────',
    ].join('\n'))
    .setImage('https://cdn.discordapp.com/attachments/1502907996303524000/1502921592001400862/mr._obvious.png?ex=6a01784e&is=6a0026ce&hm=659e55434e332c59e42bb605c11274cc925bc4975a8fe9878c718738dd95e4c6')
    .addFields(
      {
        name: '<a:swords_animated:1502891491998302208>  Trivia',
        value: [
          '`/trivia play` — Start a solo 5-question game',
          '`/trivia duel @user` — 1v1 head-to-head duel',
          '`/trivia tournament` — Multi-player bracket tournament',
        ].join('\n'),
        inline: false,
      },
      {
        name: '<a:chart_animated_purple:1502894826939748363>  Stats',
        value: [
          '`/stats me` — View your personal stats',
          '`/stats user @user` — View another player\'s stats',
          '`/stats history` — Your recent game history',
          '`/stats breakdown` — Category-by-category accuracy',
        ].join('\n'),
        inline: false,
      },
      {
        name: '<a:crown_animated_gold:1502888744032665610>  Social',
        value: [
          '`/leaderboard` — Global score rankings',
          '`/achievements` — Browse all achievements',
          '`/profile` — View your full profile card',
        ].join('\n'),
        inline: false,
      },
      {
        name: '<a:bulb_animated_yellow:1502894016826572860>  Utility',
        value: [
          '`/categories` — Browse available question categories',
          '`/streak` — Check your current streak',
          '`/help` — Show this menu',
        ].join('\n'),
        inline: false,
      },
      {
        name: '<a:shield_animated:1502894278362398780>  Admin',
        value: [
          '`/admin ban` `/admin unban` — Manage players',
          '`/admin reset` — Reset a player\'s data',
          '`/admin addquestion` `/admin removequestion` — Manage questions',
          '`/admin announce` — Send a server announcement',
          '`/admin listquestions` — List custom questions',
        ].join('\n'),
        inline: false,
      },
      {
        name: '<a:gem_purple_animated:1502893269846331492>  How Scoring Works',
        value: [
          '`Easy` → 10 pts base  `Medium` → 20 pts base  `Hard` → 30 pts base',
          'Answer faster = more points. Build streaks for bonus multipliers.',
          '<a:fire_animated:1502888273469767821> 3x streak = bonus  <a:ultra_fire:1502888540055404595> 5x streak = ON FIRE',
        ].join('\n'),
        inline: false,
      },
    )
    .setFooter({ text: 'Tip: Use /trivia play with a category and difficulty for max points!' })
    .setTimestamp()
}