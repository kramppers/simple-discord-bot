const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('lock').setDescription('Blocheaza trimiterea de mesaje in canalul curent.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const channel = interaction.channel;
    try {
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });
      await interaction.reply(embeds.warning('Canal blocat.', 'Canal'));
    } catch {
      await interaction.reply(embeds.error('Nu am putut bloca canalul.', 'Canal'));
    }
  },
};


