const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Sterge un numar de mesaje din acest canal (1-100).')
    .addIntegerOption((option) =>
      option
        .setName('numar')
        .setDescription('Cate mesaje sa stearga')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('numar', true);

    if (!interaction.channel || typeof interaction.channel.bulkDelete !== 'function') {
      await interaction.reply(embeds.error('Aceasta comanda functioneaza doar in canale text.', 'Moderare'));
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply({ embeds: [embeds.successEmbed(`S-au sters ${deleted.size} mesaje.`, 'Moderare')] });
    } catch (error) {
      await interaction.editReply({ embeds: [embeds.errorEmbed('Nu am putut sterge mesajele. Verifica permisiunile si vechimea mesajelor (<14 zile).', 'Moderare')] });
    }
  },
};


