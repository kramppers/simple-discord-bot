const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const store = require('../utils/warnsStore');
const config = require('../utils/configStore');
const { applyAction } = require('../utils/escalation');
const { sendEmbedLog } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertizeaza un membru.')
    .addUserOption((o) => o.setName('utilizator').setDescription('Membrul').setRequired(true))
    .addStringOption((o) => o.setName('motiv').setDescription('Motivul').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const reason = interaction.options.getString('motiv', true);
    const list = store.addWarning(interaction.guild.id, user.id, interaction.user.id, reason);
    await interaction.reply(embeds.warning(`${user.tag} a primit un avertisment. Total: ${list.length}`, 'Moderare'));
    await sendEmbedLog(
      interaction.guild,
      'Warn',
      `Avertisment pentru <@${user.id}> de <@${interaction.user.id}>\nMotiv: ${reason}`,
      0xfaa61a,
    );

    const cfg = config.getGuildConfig(interaction.guild.id);
    if (cfg.autoActionEnabled && list.length >= cfg.warnThreshold) {
      const ok = await applyAction(
        interaction.guild,
        user.id,
        cfg.warnAction,
        cfg.warnTimeoutMs,
        `Auto-action (warn threshold ${cfg.warnThreshold})`
      );
      if (ok) {
        await sendEmbedLog(
          interaction.guild,
          'Escalare automata',
          `Aplicata actiune '${cfg.warnAction}' pentru <@${user.id}> (warn threshold atins).`,
          0xed4245,
        );
      }
    }
  },
};


