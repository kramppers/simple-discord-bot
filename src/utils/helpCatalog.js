const { EmbedBuilder } = require('discord.js');

function getSets() {
  return {
    Utilitare: new Set([
      'ping',
      'help',
      'user',
      'server',
      'avatar',
      'whois',
      'channelinfo',
      'servericon',
      'serverroles',
      'banner',
      'uptime',
      'botinfo',
      'invitelink',
      'quote',
      'emojiinfo',
      'roleinfo',
      'remind',
      'serverstats',
      'useractivity',
      'serverbackup',
      'serveranalytics',
      'customembed',
      'serverrules',
      'translate',
      'reminder',
    ]),
    Moderare: new Set([
      'clear',
      'purgeuser',
      'slowmode',
      'lock',
      'unlock',
      'addrole',
      'removerole',
      'timeout',
      'kick',
      'ban',
      'unban',
      'nick',
      'move',
      'warn',
      'warnings',
      'clearwarn',
      'delwarn',
      'setlog',
      'antilinks',
      'antispam',
      'settings',
      'escalation',
      'say',
      'rolemanager',
      'welcome',
      'autoresponse',
    ]),
    Muzica: new Set(['join', 'play', 'pause', 'resume', 'skip', 'stop', 'queue', 'leave']),
    Fun: new Set(['8ball', 'coinflip', 'roll', 'meme', 'cat', 'dog', 'urban', 'poll', 'calc', 'snipe', 'quickpoll']),
    Economy: new Set([
      'balance',
      'daily',
      'weekly',
      'work',
      'gamble',
      'shop',
      'setup-shop',
      'transfer',
      'rob',
      'leaderboard',
      'deposit',
      'withdraw',
      'inventory',
      'lottery'
    ]),
    Admin: new Set([
      'admin',
      'settings',
      'setlog',
      'escalation',
      'antilinks',
      'antispam',
    ]),
  };
}

function categorize(client) {
  const all = Array.from(client.commands.values())
    .map((c) => ({ name: c.data.name, desc: c.data.description || '' }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const sets = getSets();
  const buckets = { Utilitare: [], Moderare: [], Muzica: [], Fun: [], Economy: [], Admin: [], Alte: [] };
  const inSet = (set) => (n) => set.has(n);
  for (const cmd of all) {
    const n = cmd.name;
    if (inSet(sets.Utilitare)(n)) buckets.Utilitare.push(cmd);
    else if (inSet(sets.Moderare)(n)) buckets.Moderare.push(cmd);
    else if (inSet(sets.Muzica)(n)) buckets.Muzica.push(cmd);
    else if (inSet(sets.Fun)(n)) buckets.Fun.push(cmd);
    else if (inSet(sets.Economy)(n)) buckets.Economy.push(cmd);
    else if (inSet(sets.Admin)(n)) buckets.Admin.push(cmd);
    else buckets.Alte.push(cmd);
  }
  return buckets;
}

function makeFieldText(arr) {
  return (
    arr
      .map((c) => `• /${c.name} — ${c.desc}`)
      .join('\n')
      .slice(0, 1000) || '—'
  );
}

function buildHelpEmbed(category, buckets, requesterTag) {
  const list = buckets[category] || [];
  return new EmbedBuilder()
    .setTitle(`Ajutor – ${category}`)
    .setColor(0x5865f2)
    .setDescription('\u200b')
    .addFields({ name: `${category} (${list.length})`, value: makeFieldText(list) })
    .setFooter({ text: `Solicitat de ${requesterTag}` })
    .setTimestamp(Date.now());
}

module.exports = { getSets, categorize, buildHelpEmbed };


