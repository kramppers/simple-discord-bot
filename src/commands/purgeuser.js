const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'moderation',
    .setName('purgeuser')
    .setDescription('Sterge ultimele N mesaje de la un anumit utilizator din acest canal (max 100).')
    .addUserOption((o) => o.setName('utilizator').setDescription('Utilizatorul').setRequired(true))
    .addIntegerOption((o) => o.setName('numar').setDescription('Cate mesaje').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const count = interaction.options.getInteger('numar', true);
    const channel = interaction.channel;
    const messages = await channel.messages.fetch({ limit: 100 });
    const toDelete = messages.filter((m) => m.author.id === user.id).first(count);
    await channel.bulkDelete(toDelete, true).catch(() => {});
    await interaction.reply(embeds.success(`S-au sters ${toDelete.length} mesaje de la ${user.tag}.`, 'Moderare'));
  },
};


