const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const config = require('../utils/configStore');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'moderation',
    .setName('escalation')
    .setDescription('Configureaza actiunile automate (dupa warn-uri sau spam).')
    .addBooleanOption((o) => o.setName('on').setDescription('Activeaza/Dezactiveaza actiunile automate').setRequired(false))
    .addIntegerOption((o) => o.setName('warn_threshold').setDescription('Pragul de warn-uri').setRequired(false).setMinValue(1).setMaxValue(10))
    .addStringOption((o) =>
      o
        .setName('warn_action')
        .setDescription('Actiune la prag: timeout sau ban')
        .setRequired(false)
        .addChoices({ name: 'timeout', value: 'timeout' }, { name: 'ban', value: 'ban' }),
    )
    .addIntegerOption((o) => o.setName('warn_timeout_min').setDescription('Durata timeout (minute)').setRequired(false).setMinValue(1).setMaxValue(1440))
    .addIntegerOption((o) => o.setName('spam_threshold').setDescription('Cate incalcari anti-spam pana la actiune').setRequired(false).setMinValue(1).setMaxValue(10))
    .addStringOption((o) =>
      o
        .setName('spam_action')
        .setDescription('Actiune pentru spam: timeout sau ban')
        .setRequired(false)
        .addChoices({ name: 'timeout', value: 'timeout' }, { name: 'ban', value: 'ban' }),
    )
    .addIntegerOption((o) => o.setName('spam_timeout_min').setDescription('Durata timeout pentru spam (minute)').setRequired(false).setMinValue(1).setMaxValue(1440))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const partial = {};
    const on = interaction.options.getBoolean('on');
    if (on !== null && on !== undefined) partial.autoActionEnabled = on;
    const wt = interaction.options.getInteger('warn_threshold');
    if (wt !== null && wt !== undefined) partial.warnThreshold = wt;
    const wa = interaction.options.getString('warn_action');
    if (wa) partial.warnAction = wa;
    const wtm = interaction.options.getInteger('warn_timeout_min');
    if (wtm !== null && wtm !== undefined) partial.warnTimeoutMs = wtm * 60 * 1000;
    const st = interaction.options.getInteger('spam_threshold');
    if (st !== null && st !== undefined) partial.spamThreshold = st;
    const sa = interaction.options.getString('spam_action');
    if (sa) partial.spamAction = sa;
    const stm = interaction.options.getInteger('spam_timeout_min');
    if (stm !== null && stm !== undefined) partial.spamTimeoutMs = stm * 60 * 1000;

    const cfg = config.updateGuildConfig(interaction.guild.id, partial);
    await interaction.reply(
      embeds.info(
        `Auto-Action: ${cfg.autoActionEnabled ? 'ON' : 'OFF'}\nWarn: ${cfg.warnThreshold} -> ${cfg.warnAction} (${Math.round(cfg.warnTimeoutMs / 60000)}m)\nSpam: ${cfg.spamThreshold} -> ${cfg.spamAction} (${Math.round(cfg.spamTimeoutMs / 60000)}m)`,
        'Escalation',
      ),
    );
  },
};


