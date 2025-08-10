const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

const answers = [
  'Da',
  'Nu',
  'Poate',
  'Sigur',
  'Mai incearca',
  'Nu cred',
  'Fara indoiala',
  'Intreaba mai tarziu',
];

module.exports = {
  data: new SlashCommandBuilder().setName('8ball').setDescription('Pune o intrebare.').addStringOption((o) => o.setName('intrebare').setDescription('Intrebarea').setRequired(true)),
  category: 'fun',
  async execute(interaction) {
    const q = interaction.options.getString('intrebare', true);
    const a = answers[Math.floor(Math.random() * answers.length)];
    await interaction.reply(embeds.info(`Q: ${q}\nA: ${a}`, '8ball'));
  },
};


