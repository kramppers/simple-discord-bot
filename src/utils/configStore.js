const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');
const storePath = path.join(dataDir, 'config.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(storePath)) fs.writeFileSync(storePath, JSON.stringify({}), 'utf8');
}

function readStore() {
  ensureStore();
  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function writeStore(obj) {
  ensureStore();
  fs.writeFileSync(storePath, JSON.stringify(obj, null, 2), 'utf8');
}

function defaultGuildConfig() {
  return {
    logChannelId: null,
    antiLinksEnabled: false,
    antiSpamEnabled: false,
    antiSpamLimit: 5,
    antiSpamWindowSeconds: 5,
    // Escalation settings
    autoActionEnabled: false,
    warnThreshold: 3,
    warnAction: 'timeout', // 'timeout' | 'ban'
    warnTimeoutMs: 10 * 60 * 1000, // 10m
    spamThreshold: 3, // spam violations before action
    spamAction: 'timeout',
    spamTimeoutMs: 10 * 60 * 1000,
  };
}

module.exports = {
  getGuildConfig(guildId) {
    const store = readStore();
    return { ...defaultGuildConfig(), ...(store[guildId] || {}) };
  },
  setGuildConfig(guildId, newConfig) {
    const store = readStore();
    store[guildId] = { ...defaultGuildConfig(), ...newConfig };
    writeStore(store);
    return store[guildId];
  },
  updateGuildConfig(guildId, partial) {
    const store = readStore();
    const current = { ...defaultGuildConfig(), ...(store[guildId] || {}) };
    store[guildId] = { ...current, ...partial };
    writeStore(store);
    return store[guildId];
  },
};


