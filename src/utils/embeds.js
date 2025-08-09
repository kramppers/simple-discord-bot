const { EmbedBuilder } = require('discord.js');

const colors = {
  info: 0x5865f2,
  success: 0x57f287,
  warning: 0xfaa61a,
  error: 0xed4245,
};

function buildEmbed(title, description, color) {
  const e = new EmbedBuilder().setColor(color).setTimestamp(Date.now());
  if (title && String(title).trim().length > 0) e.setTitle(title);
  if (description && String(description).trim().length > 0) e.setDescription(description);
  return e;
}

module.exports = {
  info(description, title = 'Info') {
    return { embeds: [buildEmbed(title, description, colors.info)] };
  },
  success(description, title = 'Succes') {
    return { embeds: [buildEmbed(title, description, colors.success)] };
  },
  warning(description, title = 'Atentie') {
    return { embeds: [buildEmbed(title, description, colors.warning)] };
  },
  error(description, title = 'Eroare') {
    return { embeds: [buildEmbed(title, description, colors.error)] };
  },
  infoEmbed(description, title = 'Info') {
    return buildEmbed(title, description, colors.info);
  },
  successEmbed(description, title = 'Succes') {
    return buildEmbed(title, description, colors.success);
  },
  warningEmbed(description, title = 'Atentie') {
    return buildEmbed(title, description, colors.warning);
  },
  errorEmbed(description, title = 'Eroare') {
    return buildEmbed(title, description, colors.error);
  },
};


