const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'admin',
    .setName('rolemanager')
    .setDescription('Gestionare avansată a rolurilor')
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Informații despre un rol')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Rolul pentru care să vezi informațiile')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('members')
        .setDescription('Listează membrii cu un rol specific')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Rolul pentru care să vezi membrii')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('compare')
        .setDescription('Compară două roluri')
        .addRoleOption(option =>
          option.setName('role1')
            .setDescription('Primul rol')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role2')
            .setDescription('Al doilea rol')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'info':
        await this.showRoleInfo(interaction);
        break;
      case 'members':
        await this.showRoleMembers(interaction);
        break;
      case 'compare':
        await this.compareRoles(interaction);
        break;
    }
  },
  
  async showRoleInfo(interaction) {
    const role = interaction.options.getRole('role');
    
    const embed = new EmbedBuilder()
      .setTitle(`👑 Informații Rol - ${role.name}`)
      .setColor(role.color)
      .addFields(
        { name: '📋 Detalii', value: `**ID:** ${role.id}\n**Culoare:** ${role.hexColor}\n**Poziție:** ${role.position}`, inline: true },
        { name: '⚙️ Setări', value: `**Mentionable:** ${role.mentionable ? 'Da' : 'Nu'}\n**Separate:** ${role.hoist ? 'Da' : 'Nu'}\n**Managed:** ${role.managed ? 'Da' : 'Nu'}`, inline: true },
        { name: '👥 Membri', value: `**Total:** ${role.members.size}`, inline: true },
        { name: '🔑 Permisiuni Cheie', value: this.getKeyPermissions(role.permissions.toArray()), inline: false }
      )
      .setFooter({ text: `Rol creat la ${role.createdAt.toLocaleDateString()}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
  
  async showRoleMembers(interaction) {
    const role = interaction.options.getRole('role');
    const members = role.members.map(member => member.user.tag);
    
    const embed = new EmbedBuilder()
      .setTitle(`👥 Membri cu rolul ${role.name}`)
      .setColor(role.color)
      .setDescription(members.length > 0 ? members.slice(0, 25).join('\n') : 'Niciun membru cu acest rol')
      .setFooter({ text: `Total: ${members.length} membri` })
      .setTimestamp();
    
    if (members.length > 25) {
      embed.addFields({ name: '📝 Notă', value: `Se afișează doar primii 25 membri din ${members.length} total.` });
    }
    
    await interaction.reply({ embeds: [embed] });
  },
  
  async compareRoles(interaction) {
    const role1 = interaction.options.getRole('role1');
    const role2 = interaction.options.getRole('role2');
    
    const embed = new EmbedBuilder()
      .setTitle(`⚖️ Comparație Roluri`)
      .addFields(
        { name: `${role1.name}`, value: `**Culoare:** ${role1.hexColor}\n**Poziție:** ${role1.position}\n**Membri:** ${role1.members.size}\n**Permisiuni:** ${role1.permissions.toArray().length}`, inline: true },
        { name: `${role2.name}`, value: `**Culoare:** ${role2.hexColor}\n**Poziție:** ${role2.position}\n**Membri:** ${role2.members.size}\n**Permisiuni:** ${role2.permissions.toArray().length}`, inline: true },
        { name: '🔍 Diferențe', value: this.getRoleDifferences(role1, role2), inline: false }
      )
      .setColor(0x5865f2)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
  
  getKeyPermissions(permissions) {
    const keyPerms = permissions.filter(perm => 
      ['Administrator', 'ManageGuild', 'ManageChannels', 'ManageRoles', 'KickMembers', 'BanMembers', 'ManageMessages'].includes(perm)
    );
    return keyPerms.length > 0 ? keyPerms.map(p => `• ${p}`).join('\n') : 'Niciuna';
  },
  
  getRoleDifferences(role1, role2) {
    const differences = [];
    if (role1.position !== role2.position) differences.push(`Poziție: ${role1.position} vs ${role2.position}`);
    if (role1.members.size !== role2.members.size) differences.push(`Membri: ${role1.members.size} vs ${role2.members.size}`);
    if (role1.permissions.toArray().length !== role2.permissions.toArray().length) differences.push(`Permisiuni: ${role1.permissions.toArray().length} vs ${role2.permissions.toArray().length}`);
    
    return differences.length > 0 ? differences.join('\n') : 'Niciuna';
  }
};
