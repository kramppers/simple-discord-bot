const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const config = require('../utils/configStore');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'moderation',
    .setName('antispam')
    .setDescription('Activeaza/dezactiveaza anti-spam sau seteaza limitele.')
    .addBooleanOption((o) => o.setName('on').setDescription('true/false').setRequired(false))
    .addIntegerOption((o) => o.setName('limita').setDescription('Mesaje permise pe fereastra').setRequired(false).setMinValue(2).setMaxValue(20))
    .addIntegerOption((o) => o.setName('fereastra').setDescription('Fereastra in secunde').setRequired(false).setMinValue(3).setMaxValue(60))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const on = interaction.options.getBoolean('on');
    const limit = interaction.options.getInteger('limita');
    const windowSeconds = interaction.options.getInteger('fereastra');
    const partial = {};
    if (on !== null && on !== undefined) partial.antiSpamEnabled = on;
    if (limit !== null && limit !== undefined) partial.antiSpamLimit = limit;
    if (windowSeconds !== null && windowSeconds !== undefined) partial.antiSpamWindowSeconds = windowSeconds;
    const cfg = config.updateGuildConfig(interaction.guild.id, partial);
    await interaction.reply(
      embeds.info(
        `Anti-spam: ${cfg.antiSpamEnabled ? 'ON' : 'OFF'} | Limita: ${cfg.antiSpamLimit}/${cfg.antiSpamWindowSeconds}s`,
        'Setari',
      ),
    );
  },
};


