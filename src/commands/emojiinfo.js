const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('emojiinfo').setDescription('Informatii despre un emoji custom.').addStringOption((o) => o.setName('emoji').setDescription('emoji-ul').setRequired(true)),
  category: 'utility',
  async execute(interaction) {
    const raw = interaction.options.getString('emoji', true);
    const match = /<(a?):(\w+):(\d+)>/.exec(raw);
    if (!match) return interaction.reply(embeds.error('Foloseste un emoji custom de pe server.', 'Emoji'));
    const [, animated, name, id] = match;
    const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?v=1`;
    const embed = new EmbedBuilder().setTitle(`Emoji: ${name}`).setImage(url).setColor(0x5865f2);
    await interaction.reply({ ...embeds.info('', 'Emoji'), embeds: [embed] });
  },
};


