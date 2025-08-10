const { SlashCommandBuilder } = require('discord.js');
const { getOrCreatePlayer } = require('../music/player');

module.exports = {
  data: new SlashCommandBuilder().setName('leave').setDescription('Paraseste canalul vocal.'),
  category: 'music',
  async execute(interaction) {
    const gmp = getOrCreatePlayer(interaction.guild);
    gmp.stop();
    gmp.disconnect();
    await interaction.reply({ content: 'Am parasit canalul.', ephemeral: true });
  },
};


