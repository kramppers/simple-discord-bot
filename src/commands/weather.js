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
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Vremea pentru un oras (sursă: open-meteo).')
    .addStringOption((o) => o.setName('oras').setDescription('ex: Bucharest').setRequired(true)),
  async execute(interaction) {
    const city = encodeURIComponent(interaction.options.getString('oras', true));
    try {
      // Geocoding
      const geo = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=ro&format=json`);
      const loc = geo.results?.[0];
      if (!loc) return interaction.reply(embeds.error('Nu am gasit locatia.', 'Vreme'));
      const lat = loc.latitude;
      const lon = loc.longitude;
      const meteo = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`);
      const cur = meteo.current;
      const embed = new EmbedBuilder()
        .setTitle(`Vreme – ${loc.name}, ${loc.country_code}`)
        .addFields(
          { name: 'Temperatura', value: `${cur.temperature_2m}°C (resimtita ${cur.apparent_temperature}°C)`, inline: true },
          { name: 'Umiditate', value: `${cur.relative_humidity_2m}%`, inline: true },
          { name: 'Vant', value: `${cur.wind_speed_10m} km/h`, inline: true },
        )
        .setColor(0x5865f2);
      await interaction.reply({ ...embeds.info('', 'Vreme'), embeds: [embed] });
    } catch {
      await interaction.reply(embeds.error('Nu am putut obtine vremea.', 'Vreme'));
    }
  },
};


