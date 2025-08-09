const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Muta un membru intr-un canal vocal.')
    .addUserOption((o) => o.setName('utilizator').setDescription('Membrul').setRequired(true))
    .addChannelOption((o) => o.setName('canal').setDescription('Canalul vocal').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const channel = interaction.options.getChannel('canal', true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply(embeds.error('Membru negasit.', 'Voice'));
    if (!channel || channel.type !== 2) return interaction.reply(embeds.error('Selecteaza un canal vocal.', 'Voice'));
    try {
      await member.voice.setChannel(channel.id);
      await interaction.reply(embeds.success(`Mutat ${user.tag} in ${channel.name}.`, 'Voice'));
    } catch {
      await interaction.reply(embeds.error('Nu am putut muta membrul.', 'Voice'));
    }
  },
};


