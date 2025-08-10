const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('servericon').setDescription('Afiseaza avatarul serverului.'),
  category: 'utility',
  async execute(interaction) {
    const guild = interaction.guild;
    const url = guild.iconURL({ size: 1024 });
    if (!url) return interaction.reply(embeds.error('Serverul nu are icon.', 'Server'));
    const embed = new EmbedBuilder().setTitle('Server Icon').setImage(url).setColor(0x5865f2);
    await interaction.reply({ ...embeds.info('', 'Server'), embeds: [embed] });
  },
};


