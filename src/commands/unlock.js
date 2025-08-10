const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('unlock').setDescription('Deblocheaza trimiterea de mesaje in canalul curent.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  category: 'moderation',
  async execute(interaction) {
    const channel = interaction.channel;
    try {
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: null });
      await interaction.reply(embeds.success('Canal deblocat.', 'Canal'));
    } catch {
      await interaction.reply(embeds.error('Nu am putut debloca canalul.', 'Canal'));
    }
  },
};


