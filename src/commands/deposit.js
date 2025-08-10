const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('deposit')
    .setDescription('Depune coins în bancă')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Cantitatea de coins de depus (sau "all" pentru toate)')
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

      // Verifică dacă are suficienți coins
      if (user.coins < amount) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Fonduri insuficiente!')
          .setDescription(`Ai doar **${user.coins} coins**, dar încerci să depui **${amount} coins**.`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // Efectuează depunerea
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { decrement: amount },
          bank: { increment: amount }
        }
      });

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🏦 Depunere reușită!')
        .setDescription(`Ai depus **${amount} coins** în bancă!`)
        .addFields(
          { name: '💰 Coins depuse', value: `${amount}`, inline: true },
          { name: '🪙 Soldul nou', value: `${user.coins}`, inline: true },
          { name: '🏦 Soldul bancă', value: `${user.bank}`, inline: true }
        )
        .setFooter({ text: 'Coins-urile sunt acum în siguranță în bancă!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in deposit command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la depunerea coins-urilor.', 
        ephemeral: true 
      });
    }
  },
};
