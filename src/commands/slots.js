const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'fun',
    .setName('slots')
    .setDescription('Joacă la sloturi pentru a câștiga coins!')
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

      // Simbolurile pentru sloturi
      const symbols = ['🍎', '🍊', '🍇', '🍓', '🍒', '💎', '7️⃣', '🎰'];
      
      // Generează 3 simboluri aleatorii
      const reels = [];
      for (let i = 0; i < 3; i++) {
        reels.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }

      // Verifică dacă toate simbolurile sunt identice (JACKPOT!)
      const isJackpot = reels[0] === reels[1] && reels[1] === reels[2];
      
      // Verifică dacă sunt 2 simboluri identice
      const hasTwoSame = (reels[0] === reels[1]) || (reels[1] === reels[2]) || (reels[0] === reels[2]);
      
      // Verifică dacă sunt simboluri speciale
      const hasSpecialSymbols = reels.includes('💎') || reels.includes('7️⃣') || reels.includes('🎰');

      let result, newCoins, transactionType, reason, multiplier;

      if (isJackpot) {
        // JACKPOT! Câștigă 10x
        multiplier = 10;
        const wonAmount = betAmount * multiplier;
        newCoins = user.coins + wonAmount;
        transactionType = 'SLOTS_JACKPOT';
        reason = `Slots JACKPOT! Won ${wonAmount} coins`;
        result = `🎉 **JACKPOT!** 🎉\nAi câștigat **${wonAmount} coins** (${multiplier}x)`;
      } else if (hasTwoSame && hasSpecialSymbols) {
        // 2 simboluri identice + simbol special = 5x
        multiplier = 5;
        const wonAmount = betAmount * multiplier;
        newCoins = user.coins + wonAmount;
        transactionType = 'SLOTS_WIN_SPECIAL';
        reason = `Slots special win! Won ${wonAmount} coins`;
        result = `🎯 **CÂȘTIG SPECIAL!** 🎯\nAi câștigat **${wonAmount} coins** (${multiplier}x)`;
      } else if (hasTwoSame) {
        // 2 simboluri identice = 2x
        multiplier = 2;
        const wonAmount = betAmount * multiplier;
        newCoins = user.coins + wonAmount;
        transactionType = 'SLOTS_WIN';
        reason = `Slots win! Won ${wonAmount} coins`;
        result = `🎯 **AI CÂȘTIGAT!** 🎯\nAi câștigat **${wonAmount} coins** (${multiplier}x)`;
      } else if (hasSpecialSymbols) {
        // Simbol special = 1.5x
        multiplier = 1.5;
        const wonAmount = Math.floor(betAmount * multiplier);
        newCoins = user.coins + wonAmount;
        transactionType = 'SLOTS_WIN_SMALL';
        reason = `Slots small win! Won ${wonAmount} coins`;
        result = `🎯 **CÂȘTIG MIC!** 🎯\nAi câștigat **${wonAmount} coins** (${multiplier}x)`;
      } else {
        // Pierde toată suma pariată
        multiplier = 0;
        newCoins = user.coins - betAmount;
        transactionType = 'SLOTS_LOSE';
        reason = `Slots lost ${betAmount} coins`;
        result = `💸 **AI PIERDUT!** 💸\nAi pierdut **${betAmount} coins**`;
      }

      // Actualizează utilizatorul
      user = await prisma.user.update({
        where: { id: user.id },
        data: { coins: newCoins }
      });

      // Adaugă tranzacția
      if (multiplier > 0) {
        await addTransaction(user.id, transactionType, betAmount * (multiplier - 1), reason);
      } else {
        await addTransaction(user.id, transactionType, -betAmount, reason);
      }

      // Creează embed-ul cu rezultatul
      const embed = new EmbedBuilder()
        .setColor(multiplier > 0 ? '#00ff00' : '#ff0000')
        .setTitle('🎰 **SLOTURI** 🎰')
        .setDescription(`**${reels.join(' | ')}**`)
        .addFields(
          { name: '💰 Pariu', value: `${betAmount} coins`, inline: true },
          { name: '🎯 Multiplicator', value: multiplier > 0 ? `${multiplier}x` : '0x', inline: true },
          { name: '🏦 Soldul nou', value: `${newCoins} coins`, inline: true }
        )
        .addFields(
          { name: '📊 Rezultat', value: result, inline: false }
        )
        .setFooter({ 
          text: multiplier > 0 ? 'Felicitări! Încearcă din nou!' : 'Mai încearcă data viitoare!' 
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in slots command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la jocul de sloturi.', 
        ephemeral: true 
      });
    }
  },
};
