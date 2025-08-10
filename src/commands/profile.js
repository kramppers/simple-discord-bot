const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('profile')
    .setDescription('Afișează profilul tău sau al altui utilizator')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Utilizatorul al cărui profil vrei să îl vezi')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const guildId = interaction.guild.id;

      // Obține utilizatorul
      const user = await getOrCreateUser(targetUser.id, guildId, targetUser.username);

      // Obține statistici suplimentare
      const transactionCount = await prisma.transaction.count({
        where: { userId: user.id }
      });

      const totalEarned = await prisma.transaction.aggregate({
        where: { 
          userId: user.id,
          amount: { gt: 0 }
        },
        _sum: { amount: true }
      });

      const totalSpent = await prisma.transaction.aggregate({
        where: { 
          userId: user.id,
          amount: { lt: 0 }
        },
        _sum: { amount: true }
      });

      // Calculează nivelul și XP-ul
      const xpForNextLevel = user.level * 100;
      const xpProgress = user.xp % 100;
      const progressBar = this.createProgressBar(xpProgress, 100);

      // Calculează data creării contului
      const createdAt = new Date(user.createdAt);
      const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`👤 Profilul lui ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(`Profilul complet al utilizatorului în **${interaction.guild.name}**`)
        .addFields(
          { name: '🪙 Coins', value: `${user.coins}`, inline: true },
          { name: '🏦 Bancă', value: `${user.bank}`, inline: true },
          { name: '💎 Total', value: `${user.coins + user.bank}`, inline: true },
          { name: '📈 Nivel', value: `${user.level}`, inline: true },
          { name: '⭐ XP', value: `${user.xp}/${xpForNextLevel}`, inline: true },
          { name: '📊 Progres', value: progressBar, inline: true },
          { name: '💳 Tranzacții', value: `${transactionCount}`, inline: true },
          { name: '💰 Total câștigat', value: `${totalEarned._sum.amount || 0}`, inline: true },
          { name: '💸 Total cheltuit', value: `${Math.abs(totalSpent._sum.amount || 0)}`, inline: true },
          { name: '📅 Cont creat', value: `<t:${Math.floor(createdAt.getTime() / 1000)}:R>`, inline: true },
          { name: '⏰ Zile active', value: `${daysSinceCreation} zile`, inline: true }
        )
        .setFooter({ text: `ID: ${targetUser.id}` })
        .setTimestamp();

      // Adaugă badge-uri pentru realizări
      const badges = this.getBadges(user, totalEarned._sum.amount || 0, daysSinceCreation);
      if (badges.length > 0) {
        embed.addFields({
          name: '🏆 Badge-uri',
          value: badges.join(' '),
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in profile command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la afișarea profilului.', 
        ephemeral: true 
      });
    }
  },

  createProgressBar(current, max, length = 10) {
    const progress = Math.round((current / max) * length);
    const filled = '█'.repeat(progress);
    const empty = '░'.repeat(length - progress);
    return filled + empty;
  },

  getBadges(user, totalEarned, daysActive) {
    const badges = [];

    // Badge-uri pentru coins
    if (user.coins >= 10000) badges.push('💰');
    if (user.coins >= 50000) badges.push('💎');
    if (user.coins >= 100000) badges.push('👑');

    // Badge-uri pentru nivel
    if (user.level >= 10) badges.push('⭐');
    if (user.level >= 25) badges.push('🌟');
    if (user.level >= 50) badges.push('💫');

    // Badge-uri pentru XP
    if (user.xp >= 1000) badges.push('🔥');
    if (user.xp >= 5000) badges.push('⚡');

    // Badge-uri pentru timpul petrecut
    if (daysActive >= 30) badges.push('📅');
    if (daysActive >= 100) badges.push('🎯');
    if (daysActive >= 365) badges.push('🎉');

    // Badge-uri pentru câștiguri
    if (totalEarned >= 50000) badges.push('🏆');
    if (totalEarned >= 100000) badges.push('💯');

    return badges;
  }
};
