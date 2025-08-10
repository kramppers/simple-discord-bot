const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('quickpoll')
    .setDescription('Creează un sondaj rapid cu reacții')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Întrebarea pentru sondaj')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Opțiunile separate prin virgulă (ex: Da, Nu, Poate)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Durata sondajului în minute (implicit: 60)')
        .setRequired(false)),
  
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options');
    const duration = parseInt(interaction.options.getString('duration')) || 60;
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Sondaj Rapid')
      .setDescription(question)
      .setColor(0x5865f2)
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setFooter({ text: `Sondaj creat de ${interaction.user.tag} • Expiră în ${duration} minute` })
      .setTimestamp();
    
    let message;
    
    if (options) {
      // Custom options poll
      const optionList = options.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
      
      if (optionList.length < 2) {
        return await interaction.reply({ content: '❌ Trebuie cel puțin 2 opțiuni pentru sondaj!', ephemeral: true });
      }
      
      if (optionList.length > 10) {
        return await interaction.reply({ content: '❌ Maxim 10 opțiuni sunt permise!', ephemeral: true });
      }
      
      const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      
      let optionsText = '';
      optionList.forEach((option, index) => {
        optionsText += `${reactions[index]} **${option}**\n`;
      });
      
      embed.addFields({ name: '📝 Opțiuni', value: optionsText });
      
      message = await interaction.reply({ embeds: [embed], fetchReply: true });
      
      // Add reactions
      for (let i = 0; i < optionList.length; i++) {
        await message.react(reactions[i]);
      }
    } else {
      // Yes/No poll
      embed.addFields({ name: '📝 Opțiuni', value: '👍 **Da**\n👎 **Nu**' });
      
      message = await interaction.reply({ embeds: [embed], fetchReply: true });
      
      // Add reactions
      await message.react('👍');
      await message.react('👎');
    }
    
    // Set up poll expiration
    setTimeout(async () => {
      try {
        const updatedMessage = await interaction.channel.messages.fetch(message.id);
        const reactions = updatedMessage.reactions.cache;
        
        let results = '';
        if (options) {
          const optionList = options.split(',').map(opt => opt.trim());
          const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
          
          optionList.forEach((option, index) => {
            const reaction = updatedMessage.reactions.cache.get(reactions[index]);
            const count = reaction ? reaction.count - 1 : 0; // Subtract bot reaction
            results += `${reactions[index]} **${option}**: ${count} voturi\n`;
          });
        } else {
          const yesReaction = updatedMessage.reactions.cache.get('👍');
          const noReaction = updatedMessage.reactions.cache.get('👎');
          const yesCount = yesReaction ? yesReaction.count - 1 : 0;
          const noCount = noReaction ? noReaction.count - 1 : 0;
          
          results = `👍 **Da**: ${yesCount} voturi\n👎 **Nu**: ${noCount} voturi`;
        }
        
        const resultEmbed = new EmbedBuilder()
          .setTitle('📊 Rezultate Sondaj')
          .setDescription(question)
          .setColor(0x00ff00)
          .addFields({ name: '📈 Rezultate', value: results })
          .setFooter({ text: 'Sondaj expirat' })
          .setTimestamp();
        
        await updatedMessage.reply({ embeds: [resultEmbed] });
      } catch (error) {
        // Message might have been deleted
        console.log('Poll message not found for results');
      }
    }, duration * 60 * 1000);
  },
};
