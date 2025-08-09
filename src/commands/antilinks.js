const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const config = require('../utils/configStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antilinks')
    .setDescription('Activeaza/dezactiveaza anti-link.')
    .addBooleanOption((o) => o.setName('on').setDescription('true/false').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const on = interaction.options.getBoolean('on', true);
    const cfg = config.updateGuildConfig(interaction.guild.id, { antiLinksEnabled: on });
    await interaction.reply(embeds.info(`Anti-links: ${cfg.antiLinksEnabled ? 'ON' : 'OFF'}`, 'Setari'));
  },
};


