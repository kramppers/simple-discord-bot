const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Informatii despre bot.'),
  async execute(interaction) {
    const { client } = interaction;
    const guildCount = client.guilds.cache.size;
    const userCount = client.users.cache.size;
    const ping = Math.round(client.ws.ping);
    const mem = process.memoryUsage();
    const usedMb = (mem.rss / 1024 / 1024).toFixed(1);

    const embed = new EmbedBuilder()
      .setTitle('Informatii bot')
      .setColor(0x57f287)
      .addFields(
        { name: 'Ping', value: `${ping}ms`, inline: true },
        { name: 'Servere', value: `${guildCount}`, inline: true },
        { name: 'Utilizatori (cache)', value: `${userCount}`, inline: true },
        { name: 'Memorie RSS', value: `${usedMb} MB`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  },
};


