const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('translate')
    .setDescription('Traduce text între limbi')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Textul de tradus')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('from')
        .setDescription('Limba sursă (ex: en, ro, fr, de)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('to')
        .setDescription('Limba țintă (ex: ro, en, fr, de)')
        .setRequired(false)),
  
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const fromLang = interaction.options.getString('from') || 'auto';
    const toLang = interaction.options.getString('to') || 'ro';
    
    // This is a mock translation - in a real bot you'd use a translation API
    const mockTranslations = {
      'hello': 'salut',
      'goodbye': 'la revedere',
      'thank you': 'mulțumesc',
      'please': 'te rog',
      'yes': 'da',
      'no': 'nu',
      'welcome': 'bun venit',
      'good morning': 'bună dimineața',
      'good night': 'noapte bună',
      'how are you': 'ce faci'
    };
    
    let translatedText = text;
    let detectedLang = 'auto';
    
    // Simple mock translation logic
    if (fromLang === 'auto' && toLang === 'ro') {
      const lowerText = text.toLowerCase();
      if (mockTranslations[lowerText]) {
        translatedText = mockTranslations[lowerText];
        detectedLang = 'en';
      }
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🌐 Traducere')
      .setColor(0x5865f2)
      .addFields(
        { name: '📝 Text Original', value: text, inline: true },
        { name: '🔤 Limba Sursă', value: detectedLang === 'auto' ? 'Detectată automat' : detectedLang.toUpperCase(), inline: true },
        { name: '🎯 Limba Țintă', value: toLang.toUpperCase(), inline: true },
        { name: '📖 Traducere', value: translatedText, inline: false }
      )
      .setFooter({ text: 'Notă: Aceasta este o traducere demonstrativă. Pentru traduceri reale, folosește un serviciu de traducere.' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
};
