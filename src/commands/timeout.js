const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const { parseDurationToMs } = require('../utils/time');

const DURATION_CHOICES = [
  { name: '60s', value: '60s' },
  { name: '5m', value: '5m' },
  { name: '10m', value: '10m' },
  { name: '1h', value: '1h' },
  { name: '1d', value: '1d' },
  { name: 'remove', value: '0s' },
];

module.exports = {
  data: new SlashCommandBuilder()
  category: 'moderation',
    .setName('timeout')
    .setDescription('Acorda sau scoate timeout (mute temporar).')
    .addUserOption((option) => option.setName('utilizator').setDescription('Membrul').setRequired(true))
    .addStringOption((option) => option.setName('durata').setDescription('Durata timeout').setRequired(true).addChoices(...DURATION_CHOICES))
    .addStringOption((option) => option.setName('motiv').setDescription('Motivul (opțional)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const durationRaw = interaction.options.getString('durata', true);
    const reason = interaction.options.getString('motiv') || 'Fara motiv';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply(embeds.error('Nu am gasit acel membru.', 'Moderare'));
    if (!member.moderatable) return interaction.reply(embeds.error('Nu pot aplica timeout acestui membru (rol prea sus?).', 'Moderare'));

    const ms = durationRaw === '0' ? 0 : parseDurationToMs(durationRaw);
    await interaction.deferReply();
    try {
      if (ms > 0) {
        await member.timeout(ms, reason);
        await interaction.editReply({ embeds: [embeds.successEmbed(`${user.tag} a primit timeout pentru ${durationRaw}.`, 'Moderare')] });
      } else {
        await member.timeout(null, reason);
        await interaction.editReply({ embeds: [embeds.successEmbed(`Timeout scos pentru ${user.tag}.`, 'Moderare')] });
      }
    } catch (error) {
      await interaction.editReply({ embeds: [embeds.errorEmbed('Nu am putut aplica modificarea de timeout. Verifica permisiunile si ierarhia rolurilor.', 'Moderare')] });
    }
  },
};


