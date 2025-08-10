const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const { getOrCreatePlayer } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('Arata melodiile din coada.'),
  category: 'music',
  async execute(interaction) {
    const gmp = getOrCreatePlayer(interaction.guild);
    const titles = gmp.queue.map((t, i) => `${i + 1}. ${t.title || t.url}`);
    if (!titles.length) {
      await interaction.reply(embeds.info('Coada este goala.', 'Music'));
      return;
    }
    const desc = titles.join('\n').slice(0, 1900);
    await interaction.reply(embeds.info(desc, 'Queue'));
  },
};


