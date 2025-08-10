require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('invitelink').setDescription('Genereaza linkul de invitare al botului.'),
  category: 'utility',
  async execute(interaction) {
    const clientId = process.env.CLIENT_ID;
    if (!clientId) {
      await interaction.reply(embeds.error('CLIENT_ID nu este setat in .env'));
      return;
    }
    const permissions = '277025508352';
    const scopes = 'bot%20applications.commands';
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes}`;
    await interaction.reply(embeds.info(`Invita botul folosind: ${url}`));
  },
};


