const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const store = require('../utils/warnsStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delwarn')
    .setDescription('Sterge un avertisment dupa index (din /warnings).')
    .addUserOption((o) => o.setName('utilizator').setDescription('Membrul').setRequired(true))
    .addIntegerOption((o) => o.setName('index').setDescription('Indexul avertismentului (incepand de la 1)').setRequired(true).setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const index = interaction.options.getInteger('index', true) - 1;
    const ok = store.removeWarning(interaction.guild.id, user.id, index);
    await interaction.reply(ok ? embeds.success(`Avertisment sters (#${index + 1}).`, 'Moderare') : embeds.error('Index invalid.', 'Moderare'));
  },
};


