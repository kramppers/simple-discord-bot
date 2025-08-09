function parseDurationToMs(value) {
  if (typeof value !== 'string') return 0;
  const match = value.trim().match(/^(\d+)\s*(s|sec|secs|m|min|mins|h|hr|hrs|d|day|days)$/i);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    sec: 1000,
    secs: 1000,
    m: 60_000,
    min: 60_000,
    mins: 60_000,
    h: 3_600_000,
    hr: 3_600_000,
    hrs: 3_600_000,
    d: 86_400_000,
    day: 86_400_000,
    days: 86_400_000,
  };
  return amount * (multipliers[unit] || 0);
}

function formatDurationMs(ms) {
  if (!ms || ms < 1000) return '0s';
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor((ms / 60000) % 60);
  const h = Math.floor((ms / 3_600_000) % 24);
  const d = Math.floor(ms / 86_400_000);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.join(' ');
}

module.exports = { parseDurationToMs, formatDurationMs };


