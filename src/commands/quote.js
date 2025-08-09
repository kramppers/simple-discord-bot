const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('quote').setDescription('Citeaza un mesaj dupa ID in acest canal.').addStringOption((o) => o.setName('id').setDescription('ID mesaj').setRequired(true)),
  async execute(interaction) {
    const id = interaction.options.getString('id', true);
    try {
      const msg = await interaction.channel.messages.fetch(id);
      const embed = new EmbedBuilder()
        .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
        .setDescription(msg.content || '*fara text*')
        .setColor(0x5865f2)
        .setFooter({ text: `#${interaction.channel.name}` })
        .setTimestamp(msg.createdTimestamp);
      await interaction.reply({ ...embeds.info('', 'Quote'), embeds: [embed] });
    } catch {
      await interaction.reply(embeds.error('Nu am putut gasi mesajul.', 'Quote'));
    }
  },
};


