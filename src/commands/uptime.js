const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

function formatDuration(seconds) {
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor((seconds / 3600) % 24);
  const d = Math.floor(seconds / 86400);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

module.exports = {
  data: new SlashCommandBuilder().setName('uptime').setDescription('Arata de cat timp este online botul.'),
  category: 'utility',
  async execute(interaction) {
    const uptime = process.uptime();
    await interaction.reply(embeds.info(`Uptime: ${formatDuration(uptime)}`, 'Bot'));
  },
};


