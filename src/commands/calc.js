const { SlashCommandBuilder } = require('discord.js');
const { evaluate } = require('mathjs');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('calc').setDescription('Calculeaza o expresie.').addStringOption((o) => o.setName('expresie').setDescription('ex: (2+3)*4').setRequired(true)),
  async execute(interaction) {
    const expr = interaction.options.getString('expresie', true);
    try {
      const result = evaluate(expr);
      await interaction.reply(embeds.success(`${expr} = ${result}`, 'Calc'));
    } catch (e) {
      await interaction.reply(embeds.error('Expresie invalida.', 'Calc'));
    }
  },
};


