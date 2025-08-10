const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

// Discord client for bot operations
const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Discord OAuth Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET || 'your_client_secret_here',
  callbackURL: process.env.CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Acasă - Discord Bot Dashboard',
    user: req.user,
    bot: botClient.user,
    isAuthenticated: req.isAuthenticated()
  });
});

app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Conectare - Discord Bot Dashboard' });
});

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/dashboard')
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const guilds = req.user.guilds.filter(guild => 
      (parseInt(guild.permissions) & 0x8) === 0x8 || 
      (parseInt(guild.permissions) & 0x20) === 0x20
    );

    // Check if bot is connected
    if (!botClient.user) {
      return res.status(503).render('error', { 
        title: 'Eroare - Discord Bot Dashboard', 
        error: 'Bot-ul Discord nu este conectat. Încearcă din nou în câteva momente.' 
      });
    }

    // Enhance guilds with bot data (member counts, etc.)
    const enhancedGuilds = guilds.map(userGuild => {
      const botGuild = botClient.guilds.cache.get(userGuild.id);
      return {
        ...userGuild,
        memberCount: botGuild ? botGuild.memberCount : 0,
        channelCount: botGuild ? botGuild.channels.cache.size : 0,
        roleCount: botGuild ? botGuild.roles.cache.size : 0,
        icon: botGuild ? botGuild.iconURL() : null
      };
    });

    res.render('dashboard', {
      title: 'Dashboard - Discord Bot Dashboard',
      user: req.user,
      guilds: enhancedGuilds,
      bot: botClient.user
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('error', { title: 'Eroare - Discord Bot Dashboard', error: 'Eroare la încărcarea dashboard-ului' });
  }
});

app.get('/dashboard/guild/:guildId', isAuthenticated, async (req, res) => {
  try {
    // Check if bot is connected
    if (!botClient.user) {
      return res.status(503).render('error', { 
        title: 'Eroare - Discord Bot Dashboard', 
        error: 'Bot-ul Discord nu este conectat. Încearcă din nou în câteva momente.' 
      });
    }

    const { guildId } = req.params;
    const guild = botClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).render('error', { title: 'Eroare - Discord Bot Dashboard', error: 'Serverul nu a fost găsit' });
    }

    // Check if user has permissions in this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || 
        (parseInt(userGuild.permissions) & 0x8) !== 0x8 && 
        (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
      return res.status(403).render('error', { title: 'Eroare - Discord Bot Dashboard', error: 'Nu ai permisiuni pentru acest server' });
    }

    const stats = {
      memberCount: guild.memberCount,
      channelCount: guild.channels.cache.size,
      roleCount: guild.roles.cache.size,
      emojiCount: guild.emojis.cache.size,
      boostLevel: guild.premiumTier,
      boostCount: guild.premiumSubscriptionCount || 0
    };

    res.render('guild', {
      title: `${guild.name} - Dashboard`,
      user: req.user,
      guild: guild,
      stats: stats,
      bot: botClient.user
    });
  } catch (error) {
    console.error('Guild dashboard error:', error);
    res.status(500).render('error', { title: 'Eroare - Discord Bot Dashboard', error: 'Eroare la încărcarea serverului' });
  }
});

// API Routes
app.get('/api/guilds', isAuthenticated, (req, res) => {
  const guilds = req.user.guilds.filter(guild => 
    (parseInt(guild.permissions) & 0x8) === 0x8 || 
    (parseInt(guild.permissions) & 0x20) === 0x20
  );
  res.json(guilds);
});

app.get('/api/bot/stats', isAuthenticated, async (req, res) => {
  try {
    const totalGuilds = botClient.guilds.cache.size;
    const totalMembers = botClient.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const status = botClient.ws.status === 0 ? 'Online' : 'Offline';
    
    res.json({
      status,
      totalGuilds,
      totalMembers,
      uptime: botClient.uptime,
      ping: botClient.ws.ping
    });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea statisticilor bot-ului' });
  }
});

app.get('/api/guild/:guildId/stats', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const guild = botClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Serverul nu a fost găsit' });
    }

    const stats = {
      memberCount: guild.memberCount,
      channelCount: guild.channels.cache.size,
      roleCount: guild.roles.cache.size,
      emojiCount: guild.emojis.cache.size,
      boostLevel: guild.premiumTier,
      boostCount: guild.premiumSubscriptionCount || 0,
      createdAt: guild.createdAt,
      owner: guild.ownerId
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea statisticilor' });
  }
});

app.get('/api/guild/:guildId/settings', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    
    // Check if user has permissions in this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || 
        (parseInt(userGuild.permissions) & 0x8) !== 0x8 && 
        (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
      return res.status(403).json({ error: 'Nu ai permisiuni pentru acest server' });
    }

    // Mock settings - in a real app, these would come from a database
    const settings = {
      welcomeSystem: true,
      antiLinks: true,
      autoModeration: true,
      notifications: true,
      logging: false,
      economy: true,
      music: true,
      games: true
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea setărilor' });
  }
});

app.post('/api/guild/:guildId/settings', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { setting, enabled } = req.body;
    
    // Check if user has permissions in this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || 
        (parseInt(userGuild.permissions) & 0x8) !== 0x8 && 
        (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
      return res.status(403).json({ error: 'Nu ai permisiuni pentru acest server' });
    }

    // In a real app, save to database
    console.log(`Setting ${setting} for guild ${guildId} set to ${enabled}`);
    
    res.json({ success: true, setting, enabled });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea setării' });
  }
});

app.get('/api/guild/:guildId/commands', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    
    // Check if user has permissions in this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || 
        (parseInt(userGuild.permissions) & 0x8) !== 0x8 && 
        (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
      return res.status(403).json({ error: 'Nu ai permisiuni pentru acest server' });
    }

    // Mock command status - in a real app, these would come from a database
    const commands = {
      moderation: true,
      economy: true,
      music: true,
      games: true,
      welcome: true,
      logging: false,
      antiSpam: true,
      autoRole: false
    };

    res.json(commands);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea comenzilor' });
  }
});

app.post('/api/guild/:guildId/commands', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { command, enabled } = req.body;
    
    // Check if user has permissions in this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || 
        (parseInt(userGuild.permissions) & 0x8) !== 0x8 && 
        (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
      return res.status(403).json({ error: 'Nu ai permisiuni pentru acest server' });
    }

    // In a real app, save to database
    console.log(`Command ${command} for guild ${guildId} set to ${enabled}`);
    
    res.json({ success: true, command, enabled });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea comenzii' });
  }
});

app.get('/api/guild/:guildId/members', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const guild = botClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Serverul nu a fost găsit' });
    }

    // Check if user has permissions in this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || 
        (parseInt(userGuild.permissions) & 0x8) !== 0x8 && 
        (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
      return res.status(403).json({ error: 'Nu ai permisiuni pentru acest server' });
    }

    // Get first 50 members for performance
    const members = await guild.members.fetch({ limit: 50 });
    const memberList = members.map(member => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName,
      avatar: member.user.displayAvatarURL(),
      joinedAt: member.joinedAt,
      roles: member.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        color: role.color
      }))
    }));

    res.json(memberList);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea membrilor' });
  }
});

app.get('/api/guild/:guildId/channels', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const guild = botClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Serverul nu a fost găsit' });
    }

    // Check if user has permissions in this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || 
        (parseInt(userGuild.permissions) & 0x8) !== 0x8 && 
        (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
      return res.status(403).json({ error: 'Nu ai permisiuni pentru acest server' });
    }

    const channels = guild.channels.cache.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      position: channel.position,
      parent: channel.parent?.name || null
    }));

    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea canalelor' });
  }
});

app.get('/api/guild/:guildId/roles', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const guild = botClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ error: 'Serverul nu a fost găsit' });
    }

    // Check if user has permissions in this guild
    const userGuild = req.user.guilds.find(g => g.id === guildId);
    if (!userGuild || 
        (parseInt(userGuild.permissions) & 0x8) !== 0x8 && 
        (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
      return res.status(403).json({ error: 'Nu ai permisiuni pentru acest server' });
    }

    const roles = guild.roles.cache.map(role => ({
      id: role.id,
      name: role.name,
      color: role.color,
      position: role.position,
      permissions: role.permissions.toArray(),
      mentionable: role.mentionable,
      hoist: role.hoist
    }));

    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea rolurilor' });
  }
});

// Command Editor Routes
app.get('/dashboard/commands', isAuthenticated, async (req, res) => {
  try {
    const commandCounts = {
      utility: 15,
      moderation: 12,
      music: 8,
      fun: 10,
      economy: 6,
      admin: 5
    };
    
    res.render('command-editor', {
      title: 'Editor Comenzi - Discord Bot Dashboard',
      user: req.user,
      bot: botClient.user,
      guilds: req.user.guilds.filter(g => 
        (parseInt(g.permissions) & 0x8) === 0x8 || 
        (parseInt(g.permissions) & 0x20) === 0x20
      ),
      commandCounts
    });
  } catch (error) {
    console.error('Error rendering command editor:', error);
    res.status(500).render('error', { error: 'Eroare la încărcarea editorului de comenzi' });
  }
});

app.get('/dashboard/bot-editor', isAuthenticated, async (req, res) => {
  try {
    res.render('bot-editor', {
      title: 'Editor Bot - Discord Bot Dashboard',
      user: req.user,
      bot: botClient.user,
      guilds: req.user.guilds.filter(g => 
        (parseInt(g.permissions) & 0x8) === 0x8 || 
        (parseInt(g.permissions) & 0x20) === 0x20
      )
    });
  } catch (error) {
    console.error('Error rendering bot editor:', error);
    res.status(500).render('error', { error: 'Eroare la încărcarea editorului de bot' });
  }
});

// API Routes for Commands
app.get('/api/commands', isAuthenticated, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    const commands = [];
    for (const file of commandFiles) {
      try {
        const command = require(path.join(commandsPath, file));
        if (command.data && command.execute) {
          commands.push({
            name: command.data.name,
            description: command.data.description,
            category: command.category || 'utility',
            code: fs.readFileSync(path.join(commandsPath, file), 'utf8')
          });
        }
      } catch (cmdError) {
        console.warn(`Warning: Could not load command ${file}:`, cmdError.message);
        // Continue with other commands
      }
    }
    
    res.json(commands);
  } catch (error) {
    console.error('Error loading commands:', error);
    res.status(500).json({ error: 'Eroare la încărcarea comenzilor' });
  }
});

app.get('/api/commands/:category', isAuthenticated, async (req, res) => {
  try {
    const { category } = req.params;
    const fs = require('fs');
    const path = require('path');
    
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    const commands = [];
    for (const file of commandFiles) {
      try {
        const command = require(path.join(commandsPath, file));
        if (command.data && command.execute) {
          // Check if command belongs to the requested category
          if (command.category === category || !category || category === 'all') {
            commands.push({
              name: command.data.name,
              description: command.data.description,
              category: command.category || 'utility',
              code: fs.readFileSync(path.join(commandsPath, file), 'utf8')
            });
          }
        }
      } catch (cmdError) {
        console.warn(`Warning: Could not load command ${file}:`, cmdError.message);
        // Continue with other commands
      }
    }
    
    res.json(commands);
  } catch (error) {
    console.error('Error loading commands:', error);
    res.status(500).json({ error: 'Eroare la încărcarea comenzilor' });
  }
});

app.post('/api/commands/save', isAuthenticated, async (req, res) => {
  try {
    const { name, description, code } = req.body;
    const fs = require('fs');
    const path = require('path');
    
    // Basic validation
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Numele și codul sunt obligatorii' });
    }
    
    // Validate command name format
    if (!/^[a-z0-9-]+$/.test(name)) {
      return res.status(400).json({ success: false, error: 'Numele comenzii poate conține doar litere mici, cifre și cratime' });
    }
    
    const commandPath = path.join(__dirname, '..', 'commands', `${name}.js`);
    
    // Check if command file exists
    if (!fs.existsSync(commandPath)) {
      return res.status(404).json({ success: false, error: 'Comanda nu a fost găsită' });
    }
    
    // Create backup before saving
    const backupPath = path.join(__dirname, '..', 'commands', `${name}.backup.${Date.now()}.js`);
    fs.copyFileSync(commandPath, backupPath);
    
    // Write the updated command file
    fs.writeFileSync(commandPath, code);
    
    // Try to validate the syntax by requiring the file
    try {
      delete require.cache[require.resolve(commandPath)];
      require(commandPath);
    } catch (validationError) {
      // Restore from backup if validation fails
      fs.copyFileSync(backupPath, commandPath);
      return res.status(400).json({ 
        success: false, 
        error: `Eroare de sintaxă în cod: ${validationError.message}` 
      });
    }
    
    // Remove backup file if everything is OK
    fs.unlinkSync(backupPath);
    
    res.json({ success: true, message: 'Comanda a fost salvată cu succes' });
  } catch (error) {
    console.error('Error saving command:', error);
    res.status(500).json({ success: false, error: 'Eroare la salvarea comenzii' });
  }
});

// API Routes for Bot Management
app.get('/api/bot/config', isAuthenticated, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(__dirname, '..', 'data', 'config.json');
    let config = {};
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error loading bot config:', error);
    res.status(500).json({ error: 'Eroare la încărcarea configurației' });
  }
});

app.post('/api/bot/config', isAuthenticated, async (req, res) => {
  try {
    const { prefix, activity, activityText, status } = req.body;
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(__dirname, '..', 'data', 'config.json');
    let config = {};
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    config.prefix = prefix;
    config.activity = activity;
    config.activityText = activityText;
    config.status = status;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving bot config:', error);
    res.status(500).json({ success: false, error: 'Eroare la salvarea configurației' });
  }
});

app.get('/api/bot/settings', isAuthenticated, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(__dirname, '..', 'data', 'config.json');
    let config = {};
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    res.json({
      autoResponse: config.autoResponse || false,
      antiLinks: config.antiLinks || false,
      antiSpam: config.antiSpam || false,
      logging: config.logging || false
    });
  } catch (error) {
    console.error('Error loading bot settings:', error);
    res.status(500).json({ error: 'Eroare la încărcarea setărilor' });
  }
});

app.post('/api/bot/settings', isAuthenticated, async (req, res) => {
  try {
    const { autoResponse, antiLinks, antiSpam, logging } = req.body;
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(__dirname, '..', 'data', 'config.json');
    let config = {};
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    config.autoResponse = autoResponse;
    config.antiLinks = antiLinks;
    config.antiSpam = antiSpam;
    config.logging = logging;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving bot settings:', error);
    res.status(500).json({ success: false, error: 'Eroare la salvarea setărilor' });
  }
});

app.get('/api/bot/stats', isAuthenticated, async (req, res) => {
  try {
    const stats = {
      status: botClient.user?.presence?.status || 'offline',
      totalGuilds: botClient.guilds.cache.size,
      totalMembers: botClient.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      uptime: formatUptime(botClient.uptime)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting bot stats:', error);
    res.status(500).json({ error: 'Eroare la obținerea statisticilor' });
  }
});

// File Management API
app.get('/api/files/:filename', isAuthenticated, async (req, res) => {
  try {
    const { filename } = req.params;
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(__dirname, '..', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fișierul nu a fost găsit' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    console.error('Error loading file:', error);
    res.status(500).json({ error: 'Eroare la încărcarea fișierului' });
  }
});

app.post('/api/files/save', isAuthenticated, async (req, res) => {
  try {
    const { filename, content } = req.body;
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(__dirname, '..', filename);
    
    // Basic validation
    if (!filename || !content) {
      return res.status(400).json({ success: false, error: 'Numele fișierului și conținutul sunt obligatorii' });
    }
    
    // Write the updated file
    fs.writeFileSync(filePath, content);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ success: false, error: 'Eroare la salvarea fișierului' });
  }
});

// Bot Actions API
app.post('/api/bot/restart', isAuthenticated, async (req, res) => {
  try {
    // This would need to be implemented based on your hosting setup
    res.json({ success: true, message: 'Comanda de repornire a fost trimisă' });
  } catch (error) {
    console.error('Error restarting bot:', error);
    res.status(500).json({ success: false, error: 'Eroare la repornirea botului' });
  }
});

app.post('/api/bot/deploy-commands', isAuthenticated, async (req, res) => {
  try {
    const { exec } = require('child_process');
    const path = require('path');
    
    const deployScript = path.join(__dirname, '..', 'deploy-commands.js');
    
    exec(`node "${deployScript}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error deploying commands:', error);
        return res.json({ success: false, error: 'Eroare la deploy-ul comenzilor' });
      }
      
      res.json({ success: true, message: 'Comenzile au fost deploy-uite cu succes' });
    });
  } catch (error) {
    console.error('Error deploying commands:', error);
    res.status(500).json({ success: false, error: 'Eroare la deploy-ul comenzilor' });
  }
});

app.post('/api/bot/clear-cache', isAuthenticated, async (req, res) => {
  try {
    // Clear require cache for commands
    Object.keys(require.cache).forEach(key => {
      if (key.includes('commands') || key.includes('utils')) {
        delete require.cache[key];
      }
    });
    
    res.json({ success: true, message: 'Cache-ul a fost curățat' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ success: false, error: 'Eroare la curățarea cache-ului' });
  }
});

app.post('/api/bot/backup', isAuthenticated, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const archiver = require('archiver');
    
    const backupPath = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupPath, `bot-backup-${timestamp}.zip`);
    
    const output = fs.createWriteStream(backupFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      res.json({ 
        success: true, 
        message: 'Backup-ul a fost creat cu succes',
        downloadUrl: `/backups/bot-backup-${timestamp}.zip`
      });
    });
    
    archive.pipe(output);
    archive.directory(path.join(__dirname, '..'), false);
    archive.finalize();
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ success: false, error: 'Eroare la crearea backup-ului' });
  }
});

// Missing API endpoints for dashboard functionality
app.get('/api/bot/status', isAuthenticated, async (req, res) => {
  try {
    const status = botClient.ws.connection ? 'online' : 'offline';
    const ping = botClient.ws.ping || 0;
    const uptime = Date.now() - botClient.uptime;
    
    // Calculate total members across all guilds
    let totalMembers = 0;
    if (botClient.guilds.cache.size > 0) {
      totalMembers = botClient.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
    }
    
    res.json({
      success: true,
      status: status,
      ping: ping,
      uptime: formatUptime(uptime),
      totalMembers: totalMembers,
      guildCount: botClient.guilds.cache.size
    });
  } catch (error) {
    console.error('Error getting bot status:', error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea statusului bot-ului' });
  }
});

app.get('/api/bot/command-stats', isAuthenticated, async (req, res) => {
  try {
    // This would typically come from a database or stats tracking system
    // For now, returning mock data
    const commandsExecuted = Math.floor(Math.random() * 1000) + 500; // Mock data
    
    res.json({
      success: true,
      commandsExecuted: commandsExecuted,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting command stats:', error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea statisticilor comenzilor' });
  }
});

app.get('/api/bot/recent-activity', isAuthenticated, async (req, res) => {
  try {
    // Mock recent activity data - in a real implementation, this would come from logs or database
    const activities = [
      {
        type: 'command',
        description: 'Comanda /help a fost executată',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        type: 'join',
        description: 'Un nou membru s-a alăturat serverului',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        type: 'info',
        description: 'Bot-ul a fost repornit',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      activities: activities
    });
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea activității recente' });
  }
});

app.post('/api/guilds/:guildId/leave', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const guild = botClient.guilds.cache.get(guildId);
    
    if (!guild) {
      return res.status(404).json({ success: false, error: 'Serverul nu a fost găsit' });
    }
    
    // Check if user has permission to leave the guild
    const member = await guild.members.fetch(req.user.id);
    if (!member.permissions.has('ManageGuild')) {
      return res.status(403).json({ success: false, error: 'Nu ai permisiuni să părăsești acest server' });
    }
    
    await guild.leave();
    
    res.json({
      success: true,
      message: 'Ai părăsit serverul cu succes'
    });
  } catch (error) {
    console.error('Error leaving guild:', error);
    res.status(500).json({ success: false, error: 'Eroare la părăsirea serverului' });
  }
});

// Additional API endpoints for bot editor
app.get('/api/bot/analytics', isAuthenticated, async (req, res) => {
  try {
    const analytics = {
      commandsUsed: Math.floor(Math.random() * 5000) + 1000,
      messagesProcessed: Math.floor(Math.random() * 10000) + 5000,
      errors: Math.floor(Math.random() * 50) + 5,
      uptime: formatUptime(Date.now() - botClient.uptime),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    res.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea analizelor' });
  }
});

app.get('/api/bot/health', isAuthenticated, async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: formatUptime(Date.now() - botClient.uptime),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      guilds: botClient.guilds.cache.size,
      users: botClient.users.cache.size,
      channels: botClient.channels.cache.size
    };
    
    res.json({
      success: true,
      health: health
    });
  } catch (error) {
    console.error('Error getting health status:', error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea statusului de sănătate' });
  }
});

// System Health Monitoring API
app.get('/api/bot/health', isAuthenticated, async (req, res) => {
  try {
    const os = require('os');
    const process = require('process');
    
    // Get system metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(1);
    
    const cpuUsage = os.loadavg()[0].toFixed(1);
    const uptime = process.uptime();
    const ping = botClient.ws.ping || 0;
    
    // Mock database status (you can implement real database health check)
    const dbStatus = 'Connected';
    const dbLatency = Math.floor(Math.random() * 50) + 5; // Mock latency
    
    res.json({
      success: true,
      health: {
        memory: {
          used: formatBytes(usedMemory),
          total: formatBytes(totalMemory),
          percentage: memoryUsage
        },
        cpu: {
          usage: cpuUsage,
          status: cpuUsage > 2 ? 'High' : 'Normal'
        },
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`
        },
        uptime: formatUptime(uptime * 1000),
        ping: `${ping}ms`
      }
    });
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea sănătății sistemului' });
  }
});

// Helper function for formatting bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Quick Actions API endpoints
app.post('/api/bot/deploy-commands', isAuthenticated, async (req, res) => {
  try {
    // This would typically run the deploy-commands script
    // For now, returning mock success
    res.json({
      success: true,
      message: 'Comenzile au fost deploy-uite cu succes'
    });
  } catch (error) {
    console.error('Error deploying commands:', error);
    res.status(500).json({ success: false, error: 'Eroare la deploy-ul comenzilor' });
  }
});

app.post('/api/bot/backup', isAuthenticated, async (req, res) => {
  try {
    // This would create a backup of the bot configuration and data
    // For now, returning mock success
    res.json({
      success: true,
      message: 'Backup-ul a fost creat cu succes',
      filename: `backup-${Date.now()}.zip`
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ success: false, error: 'Eroare la crearea backup-ului' });
  }
});

app.get('/api/bot/command-stats', isAuthenticated, async (req, res) => {
  try {
    // Mock command statistics
    const commandStats = {
      totalCommands: 75,
      activeCommands: 68,
      mostUsed: 'ping',
      leastUsed: 'urban',
      totalUsage: 15420
    };
    
    res.json({
      success: true,
      commandStats: commandStats
    });
  } catch (error) {
    console.error('Error getting command stats:', error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea statisticilor comenzilor' });
  }
});

app.get('/api/bot/advanced-settings', isAuthenticated, async (req, res) => {
  try {
    const settings = {
      autoRestart: false,
      logLevel: 'info',
      backupFrequency: 'daily',
      monitoring: true,
      alerts: true
    };
    
    res.json({
      success: true,
      settings: settings
    });
  } catch (init_error) {
    console.error('Error getting advanced settings:', init_error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea setărilor avansate' });
  }
});

app.post('/api/bot/advanced-settings', isAuthenticated, async (req, res) => {
  try {
    const { autoRestart, logLevel, backupFrequency, monitoring, alerts } = req.body;
    
    // Here you would save these settings to a config file or database
    // For now, just returning success
    
    res.json({
      success: true,
      message: 'Setările avansate au fost salvate'
    });
  } catch (error) {
    console.error('Error saving advanced settings:', error);
    res.status(500).json({ success: false, error: 'Eroare la salvarea setărilor avansate' });
  }
});

app.get('/api/bot/server-stats', isAuthenticated, async (req, res) => {
  try {
    const serverStats = botClient.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      channels: guild.channels.cache.size,
      roles: guild.roles.cache.size,
      joinedAt: guild.joinedAt
    }));
    
    res.json({
      success: true,
      serverStats: serverStats
    });
  } catch (error) {
    console.error('Error getting server stats:', error);
    res.status(500).json({ success: false, error: 'Eroare la obținerea statisticilor serverelor' });
  }
});

app.post('/api/bot/update', isAuthenticated, async (req, res) => {
  try {
    // This would typically involve git pull or other update mechanisms
    // For now, returning mock success
    
    res.json({
      success: true,
      message: 'Bot-ul a fost actualizat cu succes'
    });
  } catch (error) {
    console.error('Error updating bot:', error);
    res.status(500).json({ success: false, error: 'Eroare la actualizarea bot-ului' });
  }
});

// Serve backup files
app.get('/backups/:filename', isAuthenticated, (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(__dirname, '..', 'backups', filename);
    
    if (!require('fs').existsSync(backupPath)) {
      return res.status(404).json({ success: false, error: 'Backup-ul nu a fost găsit' });
    }
    
    res.download(backupPath);
  } catch (error) {
    console.error('Error serving backup file:', error);
    res.status(500).json({ success: false, error: 'Eroare la descărcarea backup-ului' });
  }
});

// Helper function for formatting uptime
function formatUptime(ms) {
  if (!ms) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// Start server with port fallback
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`🚀 Dashboard-ul rulează pe portul ${port}`);
    console.log(`🌐 Accesează: http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Portul ${port} este ocupat, încearcă portul ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Eroare la pornirea serverului:', err);
    }
  });
};

startServer(PORT);

// Connect bot client
botClient.login(process.env.DISCORD_TOKEN).then(() => {
  console.log('✅ Bot-ul Discord s-a conectat pentru dashboard');
}).catch(console.error);

module.exports = app;
