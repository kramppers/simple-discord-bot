const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../utils/embeds');
const store = require('../utils/warnsStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Listeaza avertismentele unui membru.')
    .addUserOption((o) => o.setName('utilizator').setDescription('Membrul').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator', true);
    const list = store.getWarnings(interaction.guild.id, user.id);
    if (!list.length) {
      await interaction.reply(embeds.info(`${user.tag} nu are avertismente.`, 'Moderare'));
      return;
    }
    const embed = new EmbedBuilder()
      .setTitle(`Avertismente – ${user.tag}`)
      .setColor(0xed4245)
      .setDescription(
        list
          .map(
            (w, i) =>
              `#${i + 1} • <t:${Math.floor(w.at / 1000)}:f> • de <@${w.moderatorId}>\nMotiv: ${w.reason}`,
          )
          .join('\n\n'),
      );
    await interaction.reply({ ...embeds.info('', 'Moderare'), embeds: [embed] });
  },
};


