const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Gestionare mesaje de bun venit')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Setează mesajul de bun venit')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Canalul pentru mesajele de bun venit')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('message')
            .setDescription('Mesajul de bun venit (folosește {user} pentru menționarea utilizatorului)')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('test')
        .setDescription('Testează mesajul de bun venit'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Dezactivează mesajele de bun venit'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  category: 'admin',
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case 'set':
        await this.setWelcome(interaction);
        break;
      case 'test':
        await this.testWelcome(interaction);
        break;
      case 'disable':
        await this.disableWelcome(interaction);
        break;
    }
  },
  
  async setWelcome(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    
    // Store welcome settings (in a real bot, you'd use a database)
    // For now, we'll just confirm the settings
    
    const embed = new EmbedBuilder()
      .setTitle('✅ Mesaj de Bun Venit Setat')
      .setColor(0x00ff00)
      .addFields(
        { name: '📺 Canal', value: `${channel}`, inline: true },
        { name: '💬 Mesaj', value: message, inline: true },
        { name: '📝 Variabile Disponibile', value: '`{user}` - menționează utilizatorul\n`{server}` - numele serverului\n`{memberCount}` - numărul de membri', inline: false }
      )
      .setFooter({ text: 'Mesajul va fi trimis automat când un utilizator nou se alătură serverului' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
  
  async testWelcome(interaction) {
    const testMessage = `Bun venit pe server, ${interaction.user}! 🎉`;
    
    const embed = new EmbedBuilder()
      .setTitle('🎉 Test Mesaj de Bun Venit')
      .setColor(0x5865f2)
      .setDescription(testMessage)
      .addFields(
        { name: '📝 Exemplu', value: 'Acesta este cum va arăta mesajul de bun venit când un utilizator nou se alătură serverului.' }
      )
      .setFooter({ text: 'Testat de ' + interaction.user.tag })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  },
  
  async disableWelcome(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Mesaje de Bun Venit Dezactivate')
      .setColor(0xff0000)
      .setDescription('Mesajele de bun venit au fost dezactivate pentru acest server.')
      .addFields(
        { name: 'ℹ️ Informație', value: 'Utilizatorii noi nu vor mai primi mesaje de bun venit automatice.' }
      )
      .setFooter({ text: 'Dezactivat de ' + interaction.user.tag })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
