const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('avatar')
    .setDescription('Afiseaza avatarul unui utilizator.')
    .addUserOption((option) => option.setName('utilizator').setDescription('Utilizatorul (optional)')),
  async execute(interaction) {
    const user = interaction.options.getUser('utilizator') || interaction.user;
    const url = user.displayAvatarURL({ size: 1024 });

    const embed = new EmbedBuilder()
      .setTitle(`Avatar – ${user.tag}`)
      .setImage(url)
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  },
};


