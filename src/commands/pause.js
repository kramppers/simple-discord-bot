const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const { getOrCreatePlayer } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pune pauza la redare.'),
  async execute(interaction) {
    const gmp = getOrCreatePlayer(interaction.guild);
    gmp.pause();
    await interaction.reply(embeds.info('Pauza.', 'Music'));
  },
};


