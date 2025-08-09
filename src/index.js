require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events, ActivityType, PermissionsBitField } = require('discord.js');
const configStore = require('./utils/configStore');
const { sendEmbedLog } = require('./utils/logger');

// Create Discord client with basic intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Load commands from src/commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((fileName) => fileName.endsWith('.js'));

for (const fileName of commandFiles) {
  const filePath = path.join(commandsPath, fileName);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Command at ${filePath} is missing required "data" or "execute" properties.`);
  }
}

client.once(Events.ClientReady, (readyClient) => {
  // eslint-disable-next-line no-console
  console.log(`✅ Logat ca ${readyClient.user.tag}`);
  readyClient.user.setActivity({
    name: '/help',
    type: ActivityType.Listening,
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: 'Comanda nu a fost gasita.', ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    const replyContent = {
      content: 'A aparut o eroare la executarea comenzii.',
      ephemeral: true,
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(replyContent);
    } else {
      await interaction.reply(replyContent);
    }
  }
});

// Snipe: memoreaza ultimul mesaj sters per canal
if (!global.__lastDeletedMessage) global.__lastDeletedMessage = new Map();
client.on(Events.MessageDelete, async (message) => {
  if (!message.guild || !message.channel) return;
  const key = `${message.guild.id}:${message.channel.id}`;
  global.__lastDeletedMessage.set(key, {
    content: message.content,
    authorTag: message.author?.tag || 'Necunoscut',
    authorAvatar: message.author?.displayAvatarURL() || undefined,
    createdAt: message.createdTimestamp || Date.now(),
  });
});

// AutoMod: anti-links and anti-spam
const LINK_REGEX = /(https?:\/\/\S+|discord\.gg\/\S+)/i;
const spamBuckets = new Map(); // guildId -> userId -> [timestamps]

function isStaff(member) {
  if (!member) return false;
  const perms = member.permissions;
  return (
    perms.has(PermissionsBitField.Flags.Administrator) ||
    perms.has(PermissionsBitField.Flags.ManageMessages)
  );
}

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const cfg = configStore.getGuildConfig(message.guild.id);
  const member = message.member;

  // Anti-links
  if (cfg.antiLinksEnabled && !isStaff(member)) {
    if (LINK_REGEX.test(message.content)) {
      try { await message.delete(); } catch {}
      try { await message.author.send(`Mesajul tau din '${message.guild.name}' a fost sters (linkuri nu sunt permise).`); } catch {}
      await sendEmbedLog(
        message.guild,
        'Anti-links',
        `Sters mesaj de la <@${message.author.id}> in <#${message.channel.id}>.`,
        0xed4245,
      );
      return;
    }
  }

  // Anti-spam + escalare
  if (cfg.antiSpamEnabled && !isStaff(member)) {
    const now = Date.now();
    let guildMap = spamBuckets.get(message.guild.id);
    if (!guildMap) { guildMap = new Map(); spamBuckets.set(message.guild.id, guildMap); }
    let arr = guildMap.get(message.author.id);
    if (!arr) { arr = []; guildMap.set(message.author.id, arr); }
    const windowMs = cfg.antiSpamWindowSeconds * 1000;
    const filtered = arr.filter((t) => now - t <= windowMs);
    filtered.push(now);
    guildMap.set(message.author.id, filtered);
    if (filtered.length > cfg.antiSpamLimit) {
      try { await message.delete(); } catch {}
      try { await message.author.send(`Te rugam nu spama pe '${message.guild.name}' (limita ${cfg.antiSpamLimit}/${cfg.antiSpamWindowSeconds}s).`); } catch {}
      await sendEmbedLog(
        message.guild,
        'Anti-spam',
        `Sters mesaj (spam) de la <@${message.author.id}> in <#${message.channel.id}>.`,
        0xfaa61a,
      );
      // Escalare automata la spam
      if (cfg.autoActionEnabled) {
        // numaram cate depasiri intr-o fereastra mai larga
        const key = `${message.guild.id}:${message.author.id}`;
        if (!global.__spamViolations) global.__spamViolations = new Map();
        const now2 = Date.now();
        const arr2 = (global.__spamViolations.get(key) || []).filter((t) => now2 - t <= 10 * 60 * 1000);
        arr2.push(now2);
        global.__spamViolations.set(key, arr2);
        if (arr2.length >= cfg.spamThreshold) {
          const { applyAction } = require('./utils/escalation');
          const ok = await applyAction(
            message.guild,
            message.author.id,
            cfg.spamAction,
            cfg.spamTimeoutMs,
            `Auto-action (spam threshold ${cfg.spamThreshold})`,
          );
          if (ok) {
            await sendEmbedLog(
              message.guild,
              'Escalare automata',
              `Aplicata actiune '${cfg.spamAction}' pentru <@${message.author.id}> (spam threshold atins).`,
              0xed4245,
            );
            global.__spamViolations.set(key, []);
          }
        }
      }
    }
  }
});

// Login
const token = process.env.DISCORD_TOKEN;
if (!token) {
  // eslint-disable-next-line no-console
  console.error('❌ Lipseste DISCORD_TOKEN in .env');
  process.exit(1);
}

client.login(token);


