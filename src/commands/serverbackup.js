const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('serverbackup')
    .setDescription('Informații despre backup-ul serverului')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const guild = interaction.guild;
    
    // Get backup information
    const channels = guild.channels.cache;
    const roles = guild.roles.cache;
    const emojis = guild.emojis.cache;
    
    const textChannels = channels.filter(ch => ch.type === 0).size;
    const voiceChannels = channels.filter(ch => ch.type === 2).size;
    const categories = channels.filter(ch => ch.type === 4).size;
    const announcements = channels.filter(ch => ch.type === 5).size;
    const stages = channels.filter(ch => ch.type === 13).size;
    const forums = channels.filter(ch => ch.type === 15).size;
    
    const managedRoles = roles.filter(role => role.managed).size;
    const customRoles = roles.filter(role => !role.managed && role.id !== guild.id).size;
    
    const staticEmojis = emojis.filter(emoji => !emoji.animated).size;
    const animatedEmojis = emojis.filter(emoji => emoji.animated).size;
    
    const embed = new EmbedBuilder()
      .setTitle(`💾 Backup Server - ${guild.name}`)
      .setColor(0x5865f2)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '📺 Canale', value: `**Text:** ${textChannels}\n**Voce:** ${voiceChannels}\n**Categorii:** ${categories}\n**Anunțuri:** ${announcements}\n**Stage:** ${stages}\n**Forum:** ${forums}`, inline: true },
        { name: '👑 Roluri', value: `**Custom:** ${customRoles}\n**Managed:** ${managedRoles}\n**Total:** ${roles.size}`, inline: true },
        { name: '😀 Emoji-uri', value: `**Static:** ${staticEmojis}\n**Animate:** ${animatedEmojis}\n**Total:** ${emojis.size}`, inline: true },
        { name: '📊 Statistici Backup', value: this.getBackupStats(guild), inline: false },
        { name: '⚠️ Notă', value: 'Aceste informații sunt utile pentru recrearea serverului în caz de nevoie.', inline: false }
      )
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
  
  getBackupStats(guild) {
    const stats = [];
    
    // Server features
    if (guild.features.includes('ANIMATED_ICON')) stats.push('• Icon animat');
    if (guild.features.includes('BANNER')) stats.push('• Banner');
    if (guild.features.includes('COMMUNITY')) stats.push('• Comunitate');
    if (guild.features.includes('DISCOVERABLE')) stats.push('• Descoperibil');
    if (guild.features.includes('FEATURABLE')) stats.push('• Recomandabil');
    if (guild.features.includes('INVITE_SPLASH')) stats.push('• Splash invitație');
    if (guild.features.includes('MEMBER_VERIFICATION_GATE_ENABLED')) stats.push('• Verificare membri');
    if (guild.features.includes('NEWS')) stats.push('• Canale de știri');
    if (guild.features.includes('PARTNERED')) stats.push('• Parteneriat');
    if (guild.features.includes('VANITY_URL')) stats.push('• URL personalizat');
    if (guild.features.includes('VERIFIED')) stats.push('• Verificat');
    if (guild.features.includes('VIP_REGIONS')) stats.push('• Regiuni VIP');
    
    return stats.length > 0 ? stats.join('\n') : 'Niciun feature special';
  }
};
