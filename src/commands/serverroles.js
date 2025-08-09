const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('serverroles').setDescription('Listeaza rolurile serverului.'),
  async execute(interaction) {
    const roles = interaction.guild.roles.cache
      .filter((r) => r.name !== '@everyone')
      .sort((a, b) => b.position - a.position)
      .map((r) => `<@&${r.id}>`);
    const text = roles.join(', ').slice(0, 3900) || 'N/A';
    await interaction.reply(embeds.info(text, 'Roluri server'));
  },
};


