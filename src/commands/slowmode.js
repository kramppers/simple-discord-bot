const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Seteaza slowmode pentru canalul curent (0-21600 sec).')
    .addIntegerOption((o) => o.setName('secunde').setDescription('Numar secunde').setRequired(true).setMinValue(0).setMaxValue(21600))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const seconds = interaction.options.getInteger('secunde', true);
    const channel = interaction.channel;
    await channel.setRateLimitPerUser(seconds).catch(() => {});
    await interaction.reply(embeds.success(`Slowmode setat la ${seconds}s.`, 'Canal'));
  },
};


