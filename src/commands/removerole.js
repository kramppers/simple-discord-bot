const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Scoate un rol de la un membru.')
    .addUserOption((o) => o.setName('utilizator').setDescription('Membrul').setRequired(true))
    .addRoleOption((o) => o.setName('rol').setDescription('Rolul').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const role = interaction.options.getRole('rol', true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply(embeds.error('Membru negasit.', 'Roluri'));
    await member.roles.remove(role).catch(() => {});
    await interaction.reply(embeds.success(`Rol scos: ${role.name} <- ${user.tag}`, 'Roluri'));
  },
};


