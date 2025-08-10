const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  category: 'utility',
    .setName('customembed')
    .setDescription('Creează un embed personalizat')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Titlul embed-ului')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Descrierea embed-ului')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Culoarea embed-ului (hex code, ex: #ff0000)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer-ul embed-ului')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('thumbnail')
        .setDescription('URL-ul pentru thumbnail')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('URL-ul pentru imagine')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#5865f2';
    const footer = interaction.options.getString('footer');
    const thumbnail = interaction.options.getString('thumbnail');
    const image = interaction.options.getString('image');
    
    // Validate color
    let embedColor = 0x5865f2;
    if (color && /^#[0-9A-F]{6}$/i.test(color)) {
      embedColor = parseInt(color.replace('#', ''), 16);
    }
    
    // Validate URLs
    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };
    
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(embedColor)
      .setTimestamp();
    
    if (footer) {
      embed.setFooter({ text: footer });
    }
    
    if (thumbnail && isValidUrl(thumbnail)) {
      embed.setThumbnail(thumbnail);
    }
    
    if (image && isValidUrl(image)) {
      embed.setImage(image);
    }
    
    // Add author info
    embed.setAuthor({
      name: interaction.user.tag,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true })
    });
    
    await interaction.reply({ embeds: [embed] });
  },
};
