const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('gamble')
    .setDescription('Pariază coins pentru a câștiga sau pierde')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Cantitatea de coins de pariat')
        .setRequired(true)
        .setMinValue(10)
    ),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const betAmount = interaction.options.getInteger('amount');

      // Obține utilizatorul
      let user = await getOrCreateUser(userId, guildId, interaction.user.username);

      // Verifică dacă are suficienți coins
      if (user.coins < betAmount) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Fonduri insuficiente!')
          .setDescription(`Ai doar **${user.coins} coins**, dar încerci să pariezi **${betAmount} coins**.`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      // Calculează șansele de câștig (40% șanse)
      const winChance = Math.random();
      const isWin = winChance < 0.4;

      let result, newCoins, transactionType, reason;

      if (isWin) {
        // Câștigă între 1.5x și 3x suma pariată
        const multiplier = 1.5 + Math.random() * 1.5;
        const wonAmount = Math.floor(betAmount * multiplier);
        newCoins = user.coins + wonAmount;
        transactionType = 'GAMBLE_WIN';
        reason = `Gambled ${betAmount} and won ${wonAmount}`;
        result = `🎉 AI CÂȘTIGAT! Ai câștigat **${wonAmount} coins** (${multiplier.toFixed(2)}x)`;
      } else {
        // Pierde toată suma pariată
        newCoins = user.coins - betAmount;
        transactionType = 'GAMBLE_LOSE';
        reason = `Gambled ${betAmount} and lost`;
        result = `💸 AI PIERDUT! Ai pierdut **${betAmount} coins**`;
      }

      // Actualizează utilizatorul
      user = await prisma.user.update({
        where: { id: user.id },
        data: { coins: newCoins }
      });

      // Adaugă tranzacția
      await addTransaction(user.id, transactionType, isWin ? betAmount : -betAmount, reason);

      const embed = new EmbedBuilder()
        .setColor(isWin ? '#00ff00' : '#ff0000')
        .setTitle('🎰 Rezultat Gambling')
        .setDescription(result)
        .addFields(
          { name: '💰 Pariu', value: `${betAmount} coins`, inline: true },
          { name: '🎯 Șanse', value: isWin ? '40% (Câștigat)' : '60% (Pierdut)', inline: true },
          { name: '🏦 Soldul nou', value: `${newCoins} coins`, inline: true }
        )
        .setFooter({ text: isWin ? 'Felicitări!' : 'Mai încearcă data viitoare!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in gamble command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la gambling.', 
        ephemeral: true 
      });
    }
  },
};
