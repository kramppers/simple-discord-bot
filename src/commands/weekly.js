const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('weekly')
    .setDescription('Primești coins săptămânal'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const now = new Date();

      // Obține utilizatorul
      let user = await getOrCreateUser(userId, guildId, interaction.user.username);

      // Verifică dacă a folosit deja comanda săptămâna aceasta
      if (user.lastWeekly) {
        const lastWeekly = new Date(user.lastWeekly);
        const timeDiff = now - lastWeekly;
        const daysLeft = 7 - Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⏰ Comanda weekly nu este disponibilă încă!')
            .setDescription(`Mai ai de așteptat **${daysLeft}z ${hoursLeft}h** până poți folosi din nou comanda.`)
            .setTimestamp();

          await interaction.reply({ embeds: [embed], ephemeral: true });
          return;
        }
      }

      // Calculează bonusul săptămânal (între 500-1500 coins)
      const baseAmount = 500;
      const bonus = Math.floor(Math.random() * 1001); // 0-1000 bonus
      const totalAmount = baseAmount + bonus;

      // Actualizează utilizatorul
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: totalAmount },
          lastWeekly: now
        }
      });

      // Adaugă tranzacția
      await addTransaction(user.id, 'WEEKLY', totalAmount, 'Weekly reward');

      const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('🌟 Weekly Reward Claimed!')
        .setDescription(`Ai primit **${totalAmount} coins** săptămânal!`)
        .addFields(
          { name: '🪙 Coins de bază', value: `${baseAmount}`, inline: true },
          { name: '🎁 Bonus', value: `${bonus}`, inline: true },
          { name: '💎 Total primit', value: `${totalAmount}`, inline: true },
          { name: '🏦 Soldul nou', value: `${user.coins}`, inline: true }
        )
        .setFooter({ text: 'Reveniți săptămâna viitoare pentru mai multe coins!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in weekly command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la primirea weekly reward-ului.', 
        ephemeral: true 
      });
    }
  },
};
