const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getOrCreateUser } = require('../data/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Afișează soldul tău sau al altui utilizator'),
  category: 'economy',
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Utilizatorul al cărui sold vrei să îl vezi')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const guildId = interaction.guild.id;

      // Obține sau creează utilizatorul
      const user = await getOrCreateUser(targetUser.id, guildId, targetUser.username);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle(`💰 Soldul lui ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '🪙 Coins', value: `${user.coins}`, inline: true },
          { name: '🏦 Bancă', value: `${user.bank}`, inline: true },
          { name: '📊 Total', value: `${user.coins + user.bank}`, inline: true },
          { name: '📈 Nivel', value: `${user.level}`, inline: true },
          { name: '⭐ XP', value: `${user.xp}`, inline: true }
        )
        .setFooter({ text: `ID: ${targetUser.id}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in balance command:', error);
      await interaction.reply({ 
        content: 'A apărut o eroare la afișarea soldului.', 
        ephemeral: true 
      });
    }
  },
};
