const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('coinflip').setDescription('Arunca o moneda.'),
  async execute(interaction) {
    const res = Math.random() < 0.5 ? 'Cap' : 'Pajura';
    await interaction.reply(embeds.info(`A iesit: ${res}`, 'Moneda'));
  },
};


