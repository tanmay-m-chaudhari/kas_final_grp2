const { v4: uuidv4 } = require("uuid");

const logs = [];
const MAX_IN_MEMORY = 50000;

function appendLogs(entries, source) {
  const timestamped = entries.map((entry) => ({
    id: uuidv4(),
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    source: source || "unknown",
  }));

  logs.push(...timestamped);

  if (logs.length > MAX_IN_MEMORY) {
    logs.splice(0, logs.length - MAX_IN_MEMORY);
  }

  return timestamped.length;
}

function queryLogs({ service, level, from, to, traceId, page = 1, limit = 100 } = {}) {
  let results = [...logs];

  if (service) results = results.filter((l) => l.service === service);
  if (level) results = results.filter((l) => l.level === level);
  if (traceId) results = results.filter((l) => l.traceId === traceId);
  if (from) results = results.filter((l) => new Date(l.timestamp) >= new Date(from));
  if (to) results = results.filter((l) => new Date(l.timestamp) <= new Date(to));

  results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const start = (page - 1) * limit;
  return {
    logs: results.slice(start, start + limit),
    total: results.length,
    page,
    totalPages: Math.ceil(results.length / limit),
  };
}

function getStats() {
  const byLevel = {};
  const byService = {};

  for (const log of logs) {
    byLevel[log.level] = (byLevel[log.level] || 0) + 1;
    byService[log.service] = (byService[log.service] || 0) + 1;
  }

  return { total: logs.length, byLevel, byService, oldestEntry: logs[0]?.timestamp || null };
}

function evictOlderThan(hours) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const before = logs.length;
  const kept = logs.filter((l) => new Date(l.timestamp) > cutoff);
  logs.length = 0;
  logs.push(...kept);
  return before - logs.length;
}

module.exports = { appendLogs, queryLogs, getStats, evictOlderThan };
