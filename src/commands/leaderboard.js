const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTopUsers } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'economy',
    .setName('leaderboard')
    .setDescription('Afișează top utilizatori după coins')
    .addIntegerOption(option =>
      option
        .setName('limit')
        .setDescription('Numărul de utilizatori de afișat (max 25)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(25)
    ),

  async execute(interaction) {
    try {
      const limit = interaction.options.getInteger('limit') || 10;
      const guildId = interaction.guild.id;

      // Obține top utilizatori
      const topUsers = await getTopUsers(guildId, limit);

      if (topUsers.length === 0) {
        await interaction.reply({ 
          content: 'Nu există utilizatori în leaderboard încă.', 
          ephemeral: true 
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('🏆 Leaderboard - Top Utilizatori')
        .setDescription(`Top **${topUsers.length}** utilizatori după coins în **${interaction.guild.name}**`)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();

      // Construiește lista de utilizatori
      let description = '';
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const position = i + 1;
        let medal = '';
        
        // Adaugă medalii pentru primele 3 locuri
        if (position === 1) medal = '🥇';
        else if (position === 2) medal = '🥈';
        else if (position === 3) medal = '🥉';
        else medal = `${position}.`;

        description += `${medal} **${user.username}** - ${user.coins} coins\n`;
      }

      embed.setDescription(description);

      // Adaugă statistici
      const totalCoins = topUsers.reduce((sum, user) => sum + user.coins, 0);
      const avgCoins = Math.round(totalCoins / topUsers.length);

      embed.addFields(
        { name: '📊 Statistici', value: `Total coins: **${totalCoins}**\nMedia: **${avgCoins}**`, inline: true }
      );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in leaderboard command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la afișarea leaderboard-ului.', 
        ephemeral: true 
      });
    }
  },
};
