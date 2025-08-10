const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Primești coins zilnic'),
  category: 'economy',

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const now = new Date();

      // Obține utilizatorul
      let user = await getOrCreateUser(userId, guildId, interaction.user.username);

      // Verifică dacă a folosit deja comanda azi
      if (user.lastDaily) {
        const lastDaily = new Date(user.lastDaily);
        const timeDiff = now - lastDaily;
        const hoursLeft = 24 - Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        if (timeDiff < 24 * 60 * 60 * 1000) {
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⏰ Comanda daily nu este disponibilă încă!')
            .setDescription(`Mai ai de așteptat **${hoursLeft}h ${minutesLeft}m** până poți folosi din nou comanda.`)
            .setTimestamp();

          await interaction.reply({ embeds: [embed], ephemeral: true });
          return;
        }
      }

      // Calculează bonusul (între 100-500 coins)
      const baseAmount = 100;
      const bonus = Math.floor(Math.random() * 401); // 0-400 bonus
      const totalAmount = baseAmount + bonus;

      // Actualizează utilizatorul
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: totalAmount },
          lastDaily: now
        }
      });

      // Adaugă tranzacția
      await addTransaction(user.id, 'DAILY', totalAmount, 'Daily reward');

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('💰 Daily Reward Claimed!')
        .setDescription(`Ai primit **${totalAmount} coins**!`)
        .addFields(
          { name: '🪙 Coins de bază', value: `${baseAmount}`, inline: true },
          { name: '🎁 Bonus', value: `${bonus}`, inline: true },
          { name: '💎 Total primit', value: `${totalAmount}`, inline: true },
          { name: '🏦 Soldul nou', value: `${user.coins}`, inline: true }
        )
        .setFooter({ text: 'Reveniți mâine pentru mai multe coins!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in daily command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la primirea daily reward-ului.', 
        ephemeral: true 
      });
    }
  },
};
