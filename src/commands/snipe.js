const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('snipe').setDescription('Arata ultimul mesaj sters din acest canal.'),
  category: 'utility',
  async execute(interaction) {
    const key = `${interaction.guild.id}:${interaction.channel.id}`;
    const sn = global.__lastDeletedMessage?.get(key);
    if (!sn) return interaction.reply(embeds.info('Nimic de aratat.', 'Snipe'));
    const embed = new EmbedBuilder()
      .setAuthor({ name: sn.authorTag, iconURL: sn.authorAvatar })
      .setDescription(sn.content || '*fara text*')
      .setColor(0x5865f2)
      .setTimestamp(sn.createdAt);
    await interaction.reply({ ...embeds.info('', 'Snipe'), embeds: [embed] });
  },
};


