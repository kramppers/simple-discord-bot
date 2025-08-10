const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const { getOrCreatePlayer } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Trece la urmatoarea melodie.'),
  category: 'music',
  async execute(interaction) {
    const gmp = getOrCreatePlayer(interaction.guild);
    gmp.skip();
    await interaction.reply(embeds.info('Skip.', 'Music'));
  },
};


