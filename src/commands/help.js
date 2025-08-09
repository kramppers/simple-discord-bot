const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embeds = require('../utils/embeds');
const helpUtil = require('../utils/helpCatalog');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Ajutor pe categorii cu butoane.'),
  async execute(interaction) {
    const buckets = helpUtil.categorize(interaction.client);
    let current = 'Utilitare';

    const makeRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_util').setLabel('Utilitare').setStyle(ButtonStyle.Primary).setDisabled(current === 'Utilitare'),
        new ButtonBuilder().setCustomId('help_mod').setLabel('Moderare').setStyle(ButtonStyle.Primary).setDisabled(current === 'Moderare'),
        new ButtonBuilder().setCustomId('help_music').setLabel('Muzica').setStyle(ButtonStyle.Primary).setDisabled(current === 'Muzica'),
        new ButtonBuilder().setCustomId('help_fun').setLabel('Fun').setStyle(ButtonStyle.Primary).setDisabled(current === 'Fun'),
        new ButtonBuilder().setCustomId('help_other').setLabel('Alte').setStyle(ButtonStyle.Secondary).setDisabled(current === 'Alte'),
      );

    const embed = helpUtil.buildHelpEmbed(current, buckets, interaction.user.tag);
    const reply = await interaction.reply({ embeds: [embed], components: [makeRow()] });

    const collector = reply.createMessageComponentCollector({ time: 60_000 });
    collector.on('collect', async (btn) => {
      if (btn.user.id !== interaction.user.id) {
        await btn.reply(embeds.error('Doar initiatorul poate folosi aceste butoane.', 'Ajutor'));
        return;
      }
      const map = {
        help_util: 'Utilitare',
        help_mod: 'Moderare',
        help_music: 'Muzica',
        help_fun: 'Fun',
        help_other: 'Alte',
      };
      const next = map[btn.customId];
      if (!next) return;
      current = next;
      const newEmbed = helpUtil.buildHelpEmbed(current, buckets, interaction.user.tag);
      await btn.update({ embeds: [newEmbed], components: [makeRow()] });
    });

    collector.on('end', async () => {
      try { await interaction.editReply({ components: [] }); } catch {}
    });
  },
};


