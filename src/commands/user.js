const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('user').setDescription('Informatii despre utilizatorul tau.'),
  category: 'utility',
  async execute(interaction) {
    const member = interaction.member;
    const embed = new EmbedBuilder()
      .setTitle('Informatii utilizator')
      .setColor(0x57f287)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: 'Tag', value: interaction.user.tag, inline: true },
        { name: 'ID', value: interaction.user.id, inline: true },
        { name: 'Creat la', value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:F>` },
        member && member.joinedTimestamp
          ? { name: 'Alaturat serverului', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` }
          : { name: 'Alaturat serverului', value: 'N/A' },
      );

    await interaction.reply({ embeds: [embed] });
  },
};


