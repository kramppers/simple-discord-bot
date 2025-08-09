const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');
const storePath = path.join(dataDir, 'warns.json');

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

function getKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

module.exports = {
  getWarnings(guildId, userId) {
    const store = readStore();
    const key = getKey(guildId, userId);
    return store[key] || [];
  },
  addWarning(guildId, userId, moderatorId, reason) {
    const store = readStore();
    const key = getKey(guildId, userId);
    const entry = {
      moderatorId,
      reason,
      at: Date.now(),
    };
    store[key] = store[key] || [];
    store[key].push(entry);
    writeStore(store);
    return store[key];
  },
  removeWarning(guildId, userId, index) {
    const store = readStore();
    const key = getKey(guildId, userId);
    const arr = store[key] || [];
    if (index >= 0 && index < arr.length) {
      arr.splice(index, 1);
      if (arr.length) store[key] = arr; else delete store[key];
      writeStore(store);
      return true;
    }
    return false;
  },
  clearWarnings(guildId, userId) {
    const store = readStore();
    const key = getKey(guildId, userId);
    delete store[key];
    writeStore(store);
  },
};


