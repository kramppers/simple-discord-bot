const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('channelinfo').setDescription('Informatii despre canalul curent.'),
  category: 'utility',
  async execute(interaction) {
    const ch = interaction.channel;
    const embed = new EmbedBuilder()
      .setTitle('Informatii canal')
      .addFields(
        { name: 'Nume', value: ch.name, inline: true },
        { name: 'ID', value: ch.id, inline: true },
        { name: 'Tip', value: ch.type, inline: true },
      )
      .setColor(0x5865f2);
    await interaction.reply({ ...embeds.info('', 'Channel'), embeds: [embed] });
  },
};


