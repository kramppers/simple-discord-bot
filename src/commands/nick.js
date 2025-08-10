const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'moderation',
    .setName('nick')
    .setDescription('Seteaza nickname pentru un membru (sau pentru tine).')
    // Required options trebuie sa fie inaintea celor optionale
    .addStringOption((o) => o.setName('nume').setDescription('Noul nickname').setRequired(true))
    .addUserOption((o) => o.setName('utilizator').setDescription('Membrul').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator') || interaction.user;
    const nick = interaction.options.getString('nume', true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply(embeds.error('Membru negasit.', 'Moderare'));
    try {
      await member.setNickname(nick);
      await interaction.reply(embeds.success(`Nickname setat: ${nick} (${user.tag})`, 'Moderare'));
    } catch {
      await interaction.reply(embeds.error('Nu am putut seta nickname-ul.', 'Moderare'));
    }
  },
};


