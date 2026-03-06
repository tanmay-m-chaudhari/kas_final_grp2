const { v4: uuidv4 } = require("uuid");

const users = new Map();
const monitors = new Map();
const checkResults = new Map();
const incidents = new Map();

function createUser(email, hashedPassword) {
  const id = uuidv4();
  users.set(id, { id, email, hashedPassword, createdAt: new Date().toISOString() });
  return users.get(id);
}

function getUserByEmail(email) {
  return [...users.values()].find((u) => u.email === email) || null;
}

function getUserById(id) {
  return users.get(id) || null;
}

function createMonitor(userId, data) {
  const id = uuidv4();
  const monitor = {
    id, userId,
    name: data.name,
    url: data.url,
    method: data.method || "GET",
    intervalSeconds: data.intervalSeconds || 60,
    timeoutMs: data.timeoutMs || 10000,
    expectedStatusCode: data.expectedStatusCode || 200,
    headers: data.headers || {},
    enabled: true,
    currentStatus: "pending",
    lastCheckedAt: null,
    uptimePercent: 100,
    createdAt: new Date().toISOString(),
  };
  monitors.set(id, monitor);
  checkResults.set(id, []);
  return monitor;
}

function getMonitorsByUser(userId) {
  return [...monitors.values()].filter((m) => m.userId === userId);
}

function getMonitorById(id) {
  return monitors.get(id) || null;
}

function updateMonitor(id, updates) {
  const m = monitors.get(id);
  if (!m) return null;
  Object.assign(m, updates);
  return m;
}

function deleteMonitor(id) {
  monitors.delete(id);
  checkResults.delete(id);
}

function recordCheckResult(monitorId, result) {
  const results = checkResults.get(monitorId) || [];
  results.unshift(result);
  if (results.length > 1000) results.splice(1000);
  checkResults.set(monitorId, results);

  const monitor = monitors.get(monitorId);
  if (monitor) {
    monitor.currentStatus = result.status;
    monitor.lastCheckedAt = result.checkedAt;
    const last100 = results.slice(0, 100);
    const up = last100.filter((r) => r.status === "up").length;
    monitor.uptimePercent = parseFloat(((up / last100.length) * 100).toFixed(2));
  }

  return result;
}

function getCheckResults(monitorId, limit = 100) {
  return (checkResults.get(monitorId) || []).slice(0, limit);
}

function createIncident(monitorId, reason) {
  const id = uuidv4();
  const incident = {
    id, monitorId, reason,
    startedAt: new Date().toISOString(),
    resolvedAt: null,
    status: "open",
  };
  incidents.set(id, incident);
  return incident;
}

function resolveIncident(monitorId) {
  const open = [...incidents.values()].find((i) => i.monitorId === monitorId && i.status === "open");
  if (open) { open.status = "resolved"; open.resolvedAt = new Date().toISOString(); }
  return open;
}

function getIncidentsByMonitor(monitorId) {
  return [...incidents.values()].filter((i) => i.monitorId === monitorId)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
}

module.exports = {
  createUser, getUserByEmail, getUserById,
  createMonitor, getMonitorsByUser, getMonitorById, updateMonitor, deleteMonitor,
  recordCheckResult, getCheckResults,
  createIncident, resolveIncident, getIncidentsByMonitor,
};
