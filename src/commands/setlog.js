const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const config = require('../utils/configStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Seteaza canalul de loguri.')
    .addChannelOption((o) => o.setName('canal').setDescription('Canalul de loguri').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const channel = interaction.options.getChannel('canal', true);
    const cfg = config.updateGuildConfig(interaction.guild.id, { logChannelId: channel.id });
    await interaction.reply(embeds.success(`Canal de loguri setat la <#${cfg.logChannelId}>.`, 'Setari'));
  },
};


