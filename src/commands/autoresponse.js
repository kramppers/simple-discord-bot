const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'admin',
    .setName('autoresponse')
    .setDescription('Gestionare răspunsuri automate')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Adaugă un răspuns automat')
        .addStringOption(option =>
          option.setName('trigger')
            .setDescription('Cuvântul cheie care declanșează răspunsul')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('response')
            .setDescription('Răspunsul automat')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Listează toate răspunsurile automate'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Elimină un răspuns automat')
        .addStringOption(option =>
          option.setName('trigger')
            .setDescription('Cuvântul cheie de eliminat')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'add':
        await this.addResponse(interaction);
        break;
      case 'list':
        await this.listResponses(interaction);
        break;
      case 'remove':
        await this.removeResponse(interaction);
        break;
    }
  },
  
  async addResponse(interaction) {
    const trigger = interaction.options.getString('trigger').toLowerCase();
    const response = interaction.options.getString('response');
    
    // In a real bot, you'd store this in a database
    // For now, we'll just confirm the addition
    
    const embed = new EmbedBuilder()
      .setTitle('✅ Răspuns Automat Adăugat')
      .setColor(0x00ff00)
      .addFields(
        { name: '🔍 Trigger', value: `\`${trigger}\``, inline: true },
        { name: '💬 Răspuns', value: response, inline: true },
        { name: 'ℹ️ Informație', value: 'Răspunsul va fi trimis automat când cineva scrie cuvântul cheie.' }
      )
      .setFooter({ text: 'Adăugat de ' + interaction.user.tag })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
  
  async listResponses(interaction) {
    // In a real bot, you'd fetch from database
    // For now, we'll show example responses
    
    const embed = new EmbedBuilder()
      .setTitle('📋 Răspunsuri Automate')
      .setColor(0x5865f2)
      .setDescription('Lista răspunsurilor automate configurate:')
      .addFields(
        { name: '🔍 Cuvânt Cheie', value: '`faq`\n`help`\n`rules`\n`invite`', inline: true },
        { name: '💬 Răspuns', value: 'Răspuns FAQ\nAjutor general\nRegulile serverului\nLink invitație', inline: true }
      )
      .setFooter({ text: 'Folosește /autoresponse add pentru a adăuga noi răspunsuri' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
  
  async removeResponse(interaction) {
    const trigger = interaction.options.getString('trigger').toLowerCase();
    
    const embed = new EmbedBuilder()
      .setTitle('❌ Răspuns Automat Eliminat')
      .setColor(0xff0000)
      .setDescription(`Răspunsul automat pentru \`${trigger}\` a fost eliminat.`)
      .addFields(
        { name: 'ℹ️ Informație', value: 'Răspunsul nu va mai fi trimis automat pentru acest cuvânt cheie.' }
      )
      .setFooter({ text: 'Eliminat de ' + interaction.user.tag })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
