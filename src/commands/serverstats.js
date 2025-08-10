const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('serverstats')
    .setDescription('Arată statistici detaliate despre server'),
  
  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    
    // Calculate various statistics
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const humanCount = totalMembers - botCount;
    
    const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size;
    const categories = guild.channels.cache.filter(channel => channel.type === 4).size;
    
    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount;
    
    const embed = new EmbedBuilder()
      .setTitle(`📊 Statistici Server - ${guild.name}`)
      .setColor(0x5865f2)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '👥 Membri', value: `Total: **${totalMembers}**\nOnline: **${onlineMembers}**\nOameni: **${humanCount}**\nBoți: **${botCount}**`, inline: true },
        { name: '📺 Canale', value: `Text: **${textChannels}**\nVoce: **${voiceChannels}**\nCategorii: **${categories}**`, inline: true },
        { name: '⚙️ Altele', value: `Roluri: **${roles}**\nEmoji-uri: **${emojis}**\nBoost Level: **${boostLevel}**\nBoosts: **${boostCount}**`, inline: true },
        { name: '📅 Creat la', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '👑 Proprietar', value: `${owner.user.tag}`, inline: false }
      )
      .setFooter({ text: `ID Server: ${guild.id}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
