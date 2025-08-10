const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'fun',
    .setName('say')
    .setDescription('Trimite un mesaj prin bot in acest canal.')
    .addStringOption((option) => option.setName('mesaj').setDescription('Textul de trimis').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  async execute(interaction) {
    const message = interaction.options.getString('mesaj', true);
    await interaction.reply(embeds.success('Mesaj trimis!'));
    await interaction.channel.send({ content: message });
  },
};


