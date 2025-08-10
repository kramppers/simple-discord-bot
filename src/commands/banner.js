const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('banner').setDescription('Afiseaza bannerul unui utilizator.').addUserOption((o) => o.setName('utilizator').setDescription('Utilizatorul')),
  category: 'utility',
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator') || interaction.user;
    const u = await interaction.client.users.fetch(user.id, { force: true });
    const banner = u.bannerURL({ size: 2048 }) || u.accentColor;
    if (!banner) return interaction.reply(embeds.error('Utilizatorul nu are banner setat.', 'Profil'));
    if (typeof banner === 'string') {
      const embed = new EmbedBuilder().setTitle(`Banner – ${u.tag}`).setImage(banner).setColor(u.accentColor || 0x5865f2);
      await interaction.reply({ ...embeds.info('', 'Profil'), embeds: [embed] });
    } else {
      await interaction.reply(embeds.info(`Culoare accent: ${banner}`, 'Profil'));
    }
  },
};


