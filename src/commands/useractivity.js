const { SlashCommandBuilder, EmbedBuilder, User } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('useractivity')
    .setDescription('Arată activitatea și informațiile unui utilizator')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utilizatorul pentru care să vezi activitatea')
        .setRequired(false)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id);
    
    // Get user activity data
    const joinedAt = member.joinedAt;
    const createdAt = targetUser.createdAt;
    const roles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .slice(0, 10);
    
    const permissions = member.permissions.toArray();
    const keyPermissions = permissions.filter(perm => 
      ['Administrator', 'ManageGuild', 'ManageChannels', 'ManageRoles', 'KickMembers', 'BanMembers'].includes(perm)
    );
    
    const embed = new EmbedBuilder()
      .setTitle(`📊 Activitate Utilizator - ${targetUser.tag}`)
      .setColor(member.displayHexColor)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '👤 Informații Generale', value: `**ID:** ${targetUser.id}\n**Tag:** ${targetUser.tag}\n**Bot:** ${targetUser.bot ? 'Da' : 'Nu'}`, inline: true },
        { name: '📅 Date', value: `**Cont creat:** <t:${Math.floor(createdAt.getTime() / 1000)}:R>\n**A intrat în server:** <t:${Math.floor(joinedAt.getTime() / 1000)}:R>`, inline: true },
        { name: '🎭 Status', value: `**Status:** ${member.presence?.status || 'offline'}\n**Nickname:** ${member.nickname || 'Niciunul'}`, inline: true },
        { name: '🔑 Permisiuni Cheie', value: keyPermissions.length > 0 ? keyPermissions.map(p => `• ${p}`).join('\n') : 'Niciuna', inline: false },
        { name: `👑 Roluri (${roles.length})`, value: roles.length > 0 ? roles.join(', ') : 'Niciun rol', inline: false }
      )
      .setFooter({ text: `Solicitat de ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
