const { PermissionsBitField } = require('discord.js');
const { sendEmbedLog } = require('./logger');

async function applyAction(guild, userId, action, timeoutMs, reason) {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return false;
    if (action === 'timeout') {
      if (!member.moderatable) return false;
      await member.timeout(timeoutMs, reason);
      await sendEmbedLog(guild, 'Auto-Action', `Timeout <@${userId}> pentru ${Math.round(timeoutMs / 60000)}m.`, 0xfaa61a);
      return true;
    }
    if (action === 'ban') {
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) return false;
      await guild.members.ban(userId, { reason });
      await sendEmbedLog(guild, 'Auto-Action', `Ban <@${userId}>.`, 0xed4245);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

module.exports = { applyAction };


