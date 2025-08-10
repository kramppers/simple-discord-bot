const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('withdraw')
    .setDescription('Retrage coins din bancă')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Cantitatea de coins de retras')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const amount = interaction.options.getInteger('amount');

      // Obține utilizatorul
      let user = await getOrCreateUser(userId, guildId, interaction.user.username);

      // Verifică dacă are suficienți coins în bancă
      if (user.bank < amount) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Fonduri insuficiente în bancă!')
          .setDescription(`Ai doar **${user.bank} coins** în bancă, dar încerci să retragi **${amount} coins**.`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // Efectuează retragerea
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: amount },
          bank: { decrement: amount }
        }
      });

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🏦 Retragere reușită!')
        .setDescription(`Ai retras **${amount} coins** din bancă!`)
        .addFields(
          { name: '💰 Coins retrase', value: `${amount}`, inline: true },
          { name: '🪙 Soldul nou', value: `${user.coins}`, inline: true },
          { name: '🏦 Soldul bancă', value: `${user.bank}`, inline: true }
        )
        .setFooter({ text: 'Coins-urile sunt acum disponibile în portofel!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in withdraw command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la retragerea coins-urilor.', 
        ephemeral: true 
      });
    }
  },
};
