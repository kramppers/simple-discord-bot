const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const store = require('../utils/warnsStore');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'moderation',
    .setName('clearwarn')
    .setDescription('Sterge toate avertismentele unui membru.')
    .addUserOption((o) => o.setName('utilizator').setDescription('Membrul').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    store.clearWarnings(interaction.guild.id, user.id);
    await interaction.reply(embeds.success(`Avertismente sterse pentru ${user.tag}.`, 'Moderare'));
  },
};


