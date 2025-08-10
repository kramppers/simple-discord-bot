const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const { getOrCreatePlayer } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('join').setDescription('Face botul sa intre in canalul tau vocal.'),
  category: 'music',
  async execute(interaction) {
    const member = interaction.member;
    if (!member?.voice?.channel) {
      await interaction.reply({ content: 'Intra intr-un canal vocal mai intai.', ephemeral: true });
      return;
    }
    const gmp = getOrCreatePlayer(interaction.guild);
    try {
      await gmp.connectTo(member);
      await interaction.reply(embeds.success(`Conectat la ${member.voice.channel.name}.`, 'Voice'));
    } catch (e) {
      await interaction.reply(embeds.error('Nu m-am putut conecta la canal.', 'Voice'));
    }
  },
};


