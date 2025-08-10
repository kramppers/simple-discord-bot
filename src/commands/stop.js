const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const { getOrCreatePlayer } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Opreste si curata coada.'),
  category: 'music',
  async execute(interaction) {
    const gmp = getOrCreatePlayer(interaction.guild);
    gmp.stop();
    await interaction.reply(embeds.success('Oprit si curatat coada.', 'Music'));
  },
};


