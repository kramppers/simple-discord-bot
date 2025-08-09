const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Da kick unui membru.')
    .addUserOption((option) => option.setName('utilizator').setDescription('Membrul').setRequired(true))
    .addStringOption((option) => option.setName('motiv').setDescription('Motivul (optional)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const reason = interaction.options.getString('motiv') || 'Fara motiv';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply(embeds.error('Nu am gasit acel membru.', 'Moderare'));
    if (!member.kickable) return interaction.reply(embeds.error('Nu pot da kick acestui membru (rol prea sus?).', 'Moderare'));

    await member.kick(reason);
    await interaction.reply(embeds.success(`${user.tag} a fost dat afara.`, 'Moderare'));
  },
};


