const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const { getOrCreatePlayer } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('resume').setDescription('Reia redarea.'),
  category: 'music',
  async execute(interaction) {
    const gmp = getOrCreatePlayer(interaction.guild);
    gmp.resume();
    await interaction.reply(embeds.success('Redarea a fost reluata.', 'Music'));
  },
};


