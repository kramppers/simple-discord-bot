const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('whois').setDescription('Informatii detaliate despre un membru.').addUserOption((o) => o.setName('utilizator').setDescription('Membrul')),
  category: 'utility',
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const roles = member ? member.roles.cache.filter((r) => r.name !== '@everyone').map((r) => `<@&${r.id}>`).join(', ') || 'N/A' : 'N/A';
    const embed = new EmbedBuilder()
      .setTitle(`Whois – ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Creat la', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
        member && member.joinedTimestamp ? { name: 'Alaturat', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true } : { name: '\u200b', value: '\u200b', inline: true },
        { name: 'Roluri', value: roles },
      )
      .setColor(0x5865f2);
    await interaction.reply({ ...embeds.info('', 'Whois'), embeds: [embed] });
  },
};


