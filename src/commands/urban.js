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
  data: new SlashCommandBuilder().setName('urban').setDescription('Cauta pe Urban Dictionary.').addStringOption((o) => o.setName('termen').setDescription('Cuvant/termen').setRequired(true)),
  async execute(interaction) {
    const term = encodeURIComponent(interaction.options.getString('termen', true));
    try {
      const json = await fetchJson(`https://api.urbandictionary.com/v0/define?term=${term}`);
      const item = json.list?.[0];
      if (!item) return interaction.reply(embeds.info('Nu am gasit definitii.', 'Urban'));
      const embed = new EmbedBuilder()
        .setTitle(item.word)
        .setURL(item.permalink)
        .setDescription((item.definition || '').slice(0, 4000))
        .addFields({ name: 'Exemplu', value: (item.example || '').slice(0, 1000) || '—' })
        .setColor(0x5865f2);
      await interaction.reply({ ...embeds.info('', 'Urban'), embeds: [embed] });
    } catch {
      await interaction.reply(embeds.error('Eroare la interogare Urban Dictionary.', 'Urban'));
    }
  },
};


