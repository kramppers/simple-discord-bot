// Configurare baza de date
require('dotenv').config();

const config = {
  database: {
    url: 'file:./dev.db',
    provider: 'sqlite'
  },
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID
  }
};

module.exports = config;
