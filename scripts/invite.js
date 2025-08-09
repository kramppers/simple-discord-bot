require('dotenv').config();

const clientId = process.env.CLIENT_ID;

if (!clientId) {
  console.error('Seteaza CLIENT_ID in .env');
  process.exit(1);
}

const permissions = '277025508352';
const scopes = 'bot%20applications.commands';
const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes}`;

console.log('Invita botul pe serverul tau folosind linkul:');
console.log(url);


