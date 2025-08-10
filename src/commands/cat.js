const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const embeds = require('../utils/embeds');
const https = require('node:https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

module.exports = {
  data: new SlashCommandBuilder().setName('cat').setDescription('O pisica random 😺'),
  category: 'fun',
  async execute(interaction) {
    try {
      const json = await fetchJson('https://aws.random.cat/meow');
      const embed = new EmbedBuilder().setImage(json.file).setColor(0x5865f2);
      await interaction.reply({ ...embeds.info('', 'Cat'), embeds: [embed] });
    } catch {
      await interaction.reply(embeds.error('Nu am putut aduce acum o imagine.', 'Cat'));
    }
  },
};


