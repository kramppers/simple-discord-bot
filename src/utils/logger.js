const { EmbedBuilder } = require('discord.js');
const config = require('./configStore');

async function sendLog(guild, payload) {
  const cfg = config.getGuildConfig(guild.id);
  if (!cfg.logChannelId) return;
  const channel = guild.channels.cache.get(cfg.logChannelId) || (await guild.channels.fetch(cfg.logChannelId).catch(() => null));
  if (!channel) return;
  await channel.send(payload);
}

async function sendEmbedLog(guild, title, description, color = 0x5865f2) {
  const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp(Date.now());
  await sendLog(guild, { embeds: [embed] });
}

module.exports = { sendLog, sendEmbedLog };


