const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser, addTransaction, prisma } = require('../data/database');

// Lista de joburi și câștigurile lor
const jobs = [
  { name: 'Programator', min: 50, max: 150, emoji: '💻' },
  { name: 'Designer', min: 40, max: 120, emoji: '🎨' },
  { name: 'Manager', min: 60, max: 180, emoji: '👔' },
  { name: 'Vânzător', min: 30, max: 100, emoji: '🛒' },
  { name: 'Bucătar', min: 35, max: 110, emoji: '👨‍🍳' },
  { name: 'Doctor', min: 80, max: 200, emoji: '👨‍⚕️' },
  { name: 'Profesor', min: 45, max: 130, emoji: '👨‍🏫' },
  { name: 'Inginer', min: 70, max: 190, emoji: '⚙️' },
  { name: 'Artist', min: 25, max: 90, emoji: '🎭' },
  { name: 'Muzician', min: 30, max: 100, emoji: '🎵' }
];

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('work')
    .setDescription('Muncește pentru a câștiga coins'),

  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;
      const now = new Date();

      // Obține utilizatorul
      let user = await getOrCreateUser(userId, guildId, interaction.user.username);

      // Verifică dacă a muncit recent (cooldown de 1 oră)
      if (user.lastWork) {
        const lastWork = new Date(user.lastWork);
        const timeDiff = now - lastWork;
        
        if (timeDiff < 60 * 60 * 1000) { // 1 oră
          const minutesLeft = Math.floor((60 * 60 * 1000 - timeDiff) / (1000 * 60));
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⏰ Prea obosit să muncești!')
            .setDescription(`Mai ai de așteptat **${minutesLeft} minute** până poți munci din nou.`)
            .setTimestamp();

          await interaction.reply({ embeds: [embed], ephemeral: true });
          return;
        }
      }

      // Alege un job random
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

      // Actualizează utilizatorul
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: earned },
          lastWork: now
        }
      });

      // Adaugă tranzacția
      await addTransaction(user.id, 'WORK', earned, `Worked as ${job.name}`);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`${job.emoji} Muncești ca ${job.name}!`)
        .setDescription(`Ai câștigat **${earned} coins**!`)
        .addFields(
          { name: '💼 Job', value: job.name, inline: true },
          { name: '💰 Câștigat', value: `${earned} coins`, inline: true },
          { name: '🏦 Soldul nou', value: `${user.coins}`, inline: true }
        )
        .setFooter({ text: 'Poți munci din nou în 1 oră!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in work command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la muncă.', 
        ephemeral: true 
      });
    }
  },
};
