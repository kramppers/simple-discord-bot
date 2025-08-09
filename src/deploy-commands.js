require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // If provided, register guild commands for faster updates

if (!token || !clientId) {
  // eslint-disable-next-line no-console
  console.error('❌ Seteaza DISCORD_TOKEN si CLIENT_ID in .env');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((fileName) => fileName.endsWith('.js'));

for (const fileName of commandFiles) {
  const filePath = path.join(commandsPath, fileName);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    // eslint-disable-next-line no-console
    console.log(`🔁 Inregistrare ${commands.length} comenzi slash...`);

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      // eslint-disable-next-line no-console
      console.log('✅ Comenzile au fost inregistrate (guild).');
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      // eslint-disable-next-line no-console
      console.log('✅ Comenzile au fost inregistrate (globale).');
      // Note: Global updates can take pana la 1 ora sa apara (de obicei cateva minute)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Eroare la inregistrarea comenzilor:', error);
    process.exitCode = 1;
  }
})();


