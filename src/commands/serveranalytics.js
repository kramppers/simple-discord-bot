const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('serveranalytics')
    .setDescription('Analize și statistici despre server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const guild = interaction.guild;
    
    // Calculate analytics
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size;
    const offlineMembers = totalMembers - onlineMembers;
    
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const humanCount = totalMembers - botCount;
    
    const channels = guild.channels.cache;
    const textChannels = channels.filter(ch => ch.type === 0).size;
    const voiceChannels = channels.filter(ch => ch.type === 2).size;
    
    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    
    // Calculate activity percentages
    const onlinePercentage = Math.round((onlineMembers / totalMembers) * 100);
    const humanPercentage = Math.round((humanCount / totalMembers) * 100);
    const botPercentage = Math.round((botCount / totalMembers) * 100);
    
    const embed = new EmbedBuilder()
      .setTitle(`📊 Analize Server - ${guild.name}`)
      .setColor(0x5865f2)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👥 Analiza Membrilor', value: `**Total:** ${totalMembers}\n**Online:** ${onlineMembers} (${onlinePercentage}%)\n**Offline:** ${offlineMembers}\n**Oameni:** ${humanCount} (${humanPercentage}%)\n**Boți:** ${botCount} (${botPercentage}%)`, inline: true },
        { name: '📺 Analiza Canalelor', value: `**Text:** ${textChannels}\n**Voce:** ${voiceChannels}\n**Total:** ${channels.size}`, inline: true },
        { name: '⚙️ Alte Statistici', value: `**Roluri:** ${roles}\n**Emoji-uri:** ${emojis}\n**Boost Level:** ${guild.premiumTier}`, inline: true },
        { name: '📈 Indicatori de Activitate', value: this.getActivityIndicators(guild), inline: false },
        { name: '🎯 Recomandări', value: this.getRecommendations(guild, onlinePercentage, humanPercentage), inline: false }
      )
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
  
  getActivityIndicators(guild) {
    const indicators = [];
    
    const onlinePercentage = Math.round((guild.members.cache.filter(m => m.presence?.status !== 'offline').size / guild.memberCount) * 100);
    
    if (onlinePercentage >= 70) indicators.push('🟢 Activitate foarte mare');
    else if (onlinePercentage >= 50) indicators.push('🟡 Activitate moderată');
    else if (onlinePercentage >= 30) indicators.push('🟠 Activitate scăzută');
    else indicators.push('🔴 Activitate foarte scăzută');
    
    if (guild.premiumTier >= 2) indicators.push('💎 Server premium');
    if (guild.features.includes('COMMUNITY')) indicators.push('🏘️ Server comunitate');
    if (guild.features.includes('VERIFIED')) indicators.push('✅ Server verificat');
    
    return indicators.join('\n');
  },
  
  getRecommendations(guild, onlinePercentage, humanPercentage) {
    const recommendations = [];
    
    if (onlinePercentage < 30) recommendations.push('• Organizează evenimente pentru a crește activitatea');
    if (humanPercentage < 70) recommendations.push('• Reduce numărul de boți pentru o comunitate mai umană');
    if (guild.channels.cache.size < 10) recommendations.push('• Adaugă mai multe canale pentru diverse activități');
    if (!guild.features.includes('COMMUNITY')) recommendations.push('• Activează funcțiile de comunitate');
    
    if (recommendations.length === 0) {
      recommendations.push('• Serverul tău este configurat optim!');
    }
    
    return recommendations.join('\n');
  }
};
