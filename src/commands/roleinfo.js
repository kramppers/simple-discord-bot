const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('roleinfo').setDescription('Informatii despre un rol.').addRoleOption((o) => o.setName('rol').setDescription('Rolul').setRequired(true)),
  category: 'utility',
  async execute(interaction) {
    const role = interaction.options.getRole('rol', true);
    const embed = new EmbedBuilder()
      .setTitle(`Rol: ${role.name}`)
      .setColor(role.color || 0x5865f2)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Membri', value: `${role.members.size}`, inline: true },
        { name: 'Mention', value: `<@&${role.id}>`, inline: true },
      );
    await interaction.reply({ ...embeds.info('', 'Rol'), embeds: [embed] });
  },
};


