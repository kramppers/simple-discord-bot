const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const https = require('node:https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'DiscordBot/1.0' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

module.exports = {
  data: new SlashCommandBuilder().setName('meme').setDescription('Ia un meme random de pe Reddit.'),
  async execute(interaction) {
    try {
      const json = await fetchJson('https://meme-api.com/gimme');
      const embed = new EmbedBuilder()
        .setTitle(json.title || 'Meme')
        .setImage(json.url)
        .setURL(json.postLink)
        .setColor(0x5865f2)
        .setFooter({ text: `r/${json.subreddit}` });
      await interaction.reply({ ...embeds.info('', 'Meme'), embeds: [embed] });
    } catch {
      await interaction.reply(embeds.error('Nu am putut aduce un meme acum.', 'Meme'));
    }
  },
};


