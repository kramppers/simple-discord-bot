const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const { parseDurationToMs, formatDurationMs } = require('../utils/time');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Seteaza un reminder privat.')
    .addStringOption((o) => o.setName('in').setDescription('Durata (ex: 10m, 1h, 2d)').setRequired(true))
    .addStringOption((o) => o.setName('mesaj').setDescription('Mesajul').setRequired(true)),
  async execute(interaction) {
    const duration = interaction.options.getString('in', true);
    const text = interaction.options.getString('mesaj', true);
    const ms = parseDurationToMs(duration);
    if (!ms || ms < 1000) {
      await interaction.reply(embeds.error('Durata invalida.', 'Reminder'));
      return;
    }
    await interaction.reply(embeds.success(`Ok, iti voi aminti in ${formatDurationMs(ms)}.`, 'Reminder'));
    setTimeout(async () => {
      try {
        await interaction.user.send(`Reminder: ${text}`);
      } catch {}
    }, ms);
  },
};


