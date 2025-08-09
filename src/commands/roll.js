const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Da cu zarul (sides si count optionale).')
    .addIntegerOption((o) => o.setName('sides').setDescription('Numar fete (2-100)').setMinValue(2).setMaxValue(100))
    .addIntegerOption((o) => o.setName('count').setDescription('Cate aruncari (1-10)').setMinValue(1).setMaxValue(10)),
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const count = interaction.options.getInteger('count') || 1;
    const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
    const total = rolls.reduce((a, b) => a + b, 0);
    const text = count > 1 ? `Rezultate: ${rolls.join(', ')} (Total: ${total})` : `Rezultat: ${rolls[0]}`;
    await interaction.reply(embeds.info(text, `🎲 d${sides} x${count}`));
  },
};


