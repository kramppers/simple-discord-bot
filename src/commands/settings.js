const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const config = require('../utils/configStore');

module.exports = {
  data: new SlashCommandBuilder().setName('settings').setDescription('Afiseaza setarile curente ale serverului.').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const cfg = config.getGuildConfig(interaction.guild.id);
    const embed = new EmbedBuilder()
      .setTitle('Setari server')
      .setColor(0x5865f2)
      .addFields(
        { name: 'Log channel', value: cfg.logChannelId ? `<#${cfg.logChannelId}>` : 'n/a', inline: true },
        { name: 'Anti-links', value: cfg.antiLinksEnabled ? 'ON' : 'OFF', inline: true },
        { name: 'Anti-spam', value: `${cfg.antiSpamEnabled ? 'ON' : 'OFF'} (${cfg.antiSpamLimit}/${cfg.antiSpamWindowSeconds}s)`, inline: true },
        { name: 'Auto-Action', value: cfg.autoActionEnabled ? 'ON' : 'OFF', inline: true },
        { name: 'Warn Escalare', value: `${cfg.warnThreshold} -> ${cfg.warnAction} (${Math.round(cfg.warnTimeoutMs / 60000)}m)`, inline: true },
        { name: 'Spam Escalare', value: `${cfg.spamThreshold} -> ${cfg.spamAction} (${Math.round(cfg.spamTimeoutMs / 60000)}m)`, inline: true },
      );
    await interaction.reply({ ...embeds.info('', 'Setari'), embeds: [embed] });
  },
};


