const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Baneaza un membru.')
    .addUserOption((option) => option.setName('utilizator').setDescription('Membrul').setRequired(true))
    .addIntegerOption((option) =>
      option
        .setName('zile')
        .setDescription('Sterge mesajele din ultimele zile (0-7)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7),
    )
    .addStringOption((option) => option.setName('motiv').setDescription('Motivul (optional)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const reason = interaction.options.getString('motiv') || 'Fara motiv';
    const days = interaction.options.getInteger('zile') ?? 0;

    await interaction.deferReply();
    try {
      const seconds = Math.max(0, Math.min(7, days)) * 86400;
      await interaction.guild.members.ban(user.id, { deleteMessageSeconds: seconds, reason });
      await interaction.editReply({ embeds: [embeds.successEmbed(`${user.tag} a fost banat.`, 'Moderare')] });
    } catch (error) {
      await interaction.editReply({ embeds: [embeds.errorEmbed('Nu am putut bana acest membru. Verifica permisiunile si ierarhia rolurilor.', 'Moderare')] });
    }
  },
};


