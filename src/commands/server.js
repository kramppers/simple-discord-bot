const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('server').setDescription('Informatii despre server.'),
  category: 'utility',
  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: 'Aceasta comanda functioneaza doar intr-un server.' });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('Informatii server')
      .setColor(0xfee75c)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Nume', value: guild.name, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Membri', value: `${guild.memberCount}`, inline: true },
        { name: 'Creat la', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>` },
      );

    await interaction.reply({ embeds: [embed] });
  },
};


