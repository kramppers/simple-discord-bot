const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('rob')
    .setDescription('Încearcă să furi coins de la alt utilizator')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Utilizatorul pe care vrei să îl jefuiești')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const robberId = interaction.user.id;
      const victimId = interaction.options.getUser('user').id;
      const guildId = interaction.guild.id;
      const now = new Date();

      // Verifică dacă nu încearcă să se jefuiască pe sine
      if (robberId === victimId) {
        await interaction.reply({ 
          content: 'Nu poți să te jefuiești pe tine însuți!', 
          ephemeral: true 
        });
        return;
      }

      // Obține utilizatorii
      const robber = await getOrCreateUser(robberId, guildId, interaction.user.username);
      const victim = await getOrCreateUser(victimId, guildId, interaction.options.getUser('user').username);

      // Verifică dacă victima are coins
      if (victim.coins < 50) {
        await interaction.reply({ 
          content: 'Această persoană nu are suficienți coins pentru a fi jefuită!', 
          ephemeral: true 
        });
        return;
      }

      // Verifică cooldown-ul pentru rob (2 ore)
      if (robber.lastRob) {
        const lastRob = new Date(robber.lastRob);
        const timeDiff = now - lastRob;
        
        if (timeDiff < 2 * 60 * 60 * 1000) { // 2 ore
          const hoursLeft = Math.floor((2 * 60 * 60 * 1000 - timeDiff) / (1000 * 60 * 60));
          const minutesLeft = Math.floor(((2 * 60 * 60 * 1000 - timeDiff) % (1000 * 60 * 60)) / (1000 * 60));
          
          await interaction.reply({ 
            content: `Mai ai de așteptat **${hoursLeft}h ${minutesLeft}m** până poți încerca să jefuiești din nou.`, 
            ephemeral: true 
          });
          return;
        }
      }

      // Calculează șansele de succes (30% șanse)
      const successChance = Math.random();
      const isSuccess = successChance < 0.3;

      let result, stolenAmount, transactionType, reason;

      if (isSuccess) {
        // Jefuiește între 10% și 30% din coins-urile victimei
        const stealPercentage = 0.1 + Math.random() * 0.2;
        stolenAmount = Math.floor(victim.coins * stealPercentage);
        
        // Actualizează ambele utilizatori
        await prisma.user.update({
          where: { id: robber.id },
          data: { 
            coins: { increment: stolenAmount },
            lastRob: now
          }
        });

        await prisma.user.update({
          where: { id: victim.id },
          data: { coins: { decrement: stolenAmount } }
        });

        transactionType = 'ROB';
        reason = `Robbed ${stolenAmount} from ${victim.username}`;
        result = `🦹‍♂️ JEFUIRE REUȘITĂ! Ai furat **${stolenAmount} coins** de la **${victim.username}**!`;
      } else {
        // Eșuează și pierde între 50-200 coins
        const penalty = Math.floor(Math.random() * 151) + 50;
        stolenAmount = -penalty;
        
        // Actualizează jefuitorul
        await prisma.user.update({
          where: { id: robber.id },
          data: { 
            coins: { decrement: penalty },
            lastRob: now
          }
        });

        transactionType = 'ROB';
        reason = `Failed robbery, lost ${penalty}`;
        result = `🚔 JEFUIRE EȘUATĂ! Ai fost prins și ai pierdut **${penalty} coins**!`;
      }

      // Adaugă tranzacția
      await addTransaction(robber.id, transactionType, stolenAmount, reason);

      const embed = new EmbedBuilder()
        .setColor(isSuccess ? '#00ff00' : '#ff0000')
        .setTitle('🦹‍♂️ Rezultat Jefuire')
        .setDescription(result)
        .addFields(
          { name: '👤 Jefuitor', value: interaction.user.username, inline: true },
          { name: '👥 Victimă', value: victim.username, inline: true },
          { name: '💰 Rezultat', value: isSuccess ? `+${stolenAmount} coins` : `${stolenAmount} coins`, inline: true },
          { name: '🎯 Șanse', value: '30% (Jefuire)', inline: true }
        )
        .setFooter({ text: isSuccess ? 'Felicitări pentru jefuirea reușită!' : 'Mai încearcă data viitoare!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in rob command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la încercarea de jefuire.', 
        ephemeral: true 
      });
    }
  },
};
