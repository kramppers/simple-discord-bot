const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'moderation',
    .setName('unban')
    .setDescription('Debaneaza un utilizator dupa ID.')
    .addStringOption((option) => option.setName('user_id').setDescription('ID-ul utilizatorului').setRequired(true))
    .addStringOption((option) => option.setName('motiv').setDescription('Motivul (optional)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const userId = interaction.options.getString('user_id', true);
    const reason = interaction.options.getString('motiv') || 'Fara motiv';

    await interaction.deferReply();
    try {
      await interaction.guild.bans.remove(userId, reason);
      await interaction.editReply({ embeds: [embeds.successEmbed(`Utilizatorul cu ID ${userId} a fost debanat.`, 'Moderare')] });
    } catch (error) {
      await interaction.editReply({ embeds: [embeds.errorEmbed('Nu am putut debana acel utilizator. Verifica daca ID-ul este corect.', 'Moderare')] });
    }
  },
};


