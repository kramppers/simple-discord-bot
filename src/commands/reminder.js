const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('reminder')
    .setDescription('Setează un reminder personal')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Timpul până la reminder (ex: 1h, 30m, 2d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Mesajul reminder-ului')
        .setRequired(true)),
  
  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    
    // Parse time string
    const timeMatch = timeStr.match(/^(\d+)([mhd])$/);
    if (!timeMatch) {
      return await interaction.reply({ 
        content: '❌ Format invalid! Folosește formatul: 30m, 2h, 1d (minute, ore, zile)', 
        ephemeral: true 
      });
    }
    
    const amount = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    
    let milliseconds;
    switch (unit) {
      case 'm':
        milliseconds = amount * 60 * 1000;
        break;
      case 'h':
        milliseconds = amount * 60 * 60 * 1000;
        break;
      case 'd':
        milliseconds = amount * 24 * 60 * 60 * 1000;
        break;
      default:
        return await interaction.reply({ 
          content: '❌ Unitate invalidă! Folosește m (minute), h (ore), sau d (zile)', 
          ephemeral: true 
        });
    }
    
    if (milliseconds < 60000 || milliseconds > 7 * 24 * 60 * 60 * 1000) {
      return await interaction.reply({ 
        content: '❌ Timpul trebuie să fie între 1 minut și 7 zile!', 
        ephemeral: true 
      });
    }
    
    const endTime = Date.now() + milliseconds;
    
    const embed = new EmbedBuilder()
      .setTitle('⏰ Reminder Setat')
      .setColor(0x00ff00)
      .addFields(
        { name: '📝 Mesaj', value: message, inline: true },
        { name: '⏱️ Timp', value: timeStr, inline: true },
        { name: '🕐 Expiră la', value: `<t:${Math.floor(endTime / 1000)}:F>`, inline: true }
      )
      .setFooter({ text: 'Vei fi notificat când timpul expiră' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
    
    // Set the reminder
    setTimeout(async () => {
      try {
        const reminderEmbed = new EmbedBuilder()
          .setTitle('⏰ Reminder!')
          .setDescription(message)
          .setColor(0xff6b6b)
          .setFooter({ text: 'Reminder setat de ' + interaction.user.tag })
          .setTimestamp();
        
        await interaction.user.send({ embeds: [reminderEmbed] });
      } catch (error) {
        // User might have DMs disabled, try to reply in the original channel
        try {
          await interaction.followUp({ 
            content: `⏰ **Reminder pentru ${interaction.user}:** ${message}`,
            ephemeral: false 
          });
        } catch (followUpError) {
          console.log('Could not send reminder notification');
        }
      }
    }, milliseconds);
  },
};
