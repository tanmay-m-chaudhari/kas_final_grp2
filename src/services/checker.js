const fetch = require("node-fetch");
const store = require("../models/store");
const config = require("../config");

const activeTimers = new Map();

async function performCheck(monitor) {
  const start = Date.now();
  let status = "down";
  let responseTimeMs = null;
  let statusCode = null;
  let error = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), monitor.timeoutMs);
    const res = await fetch(monitor.url, {
      method: monitor.method,
      headers: monitor.headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    responseTimeMs = Date.now() - start;
    statusCode = res.status;
    status = statusCode === monitor.expectedStatusCode ? "up" : "down";
  } catch (err) {
    responseTimeMs = Date.now() - start;
    error = err.name === "AbortError" ? "Timeout" : err.message;
    status = "down";
  }

  const result = {
    id: require("uuid").v4(),
    monitorId: monitor.id,
    status,
    statusCode,
    responseTimeMs,
    error,
    checkedAt: new Date().toISOString(),
  };

  store.recordCheckResult(monitor.id, result);

  if (status === "down") {
    const existing = store.getIncidentsByMonitor(monitor.id).find((i) => i.status === "open");
    if (!existing) store.createIncident(monitor.id, error || `Unexpected status ${statusCode}`);
  } else {
    store.resolveIncident(monitor.id);
  }

  return result;
}

function scheduleMonitor(monitor) {
  if (activeTimers.has(monitor.id)) {
    clearInterval(activeTimers.get(monitor.id));
  }
  const timer = setInterval(() => performCheck(monitor), monitor.intervalSeconds * 1000);
  activeTimers.set(monitor.id, timer);
}

function unscheduleMonitor(monitorId) {
  if (activeTimers.has(monitorId)) {
    clearInterval(activeTimers.get(monitorId));
    activeTimers.delete(monitorId);
  }
}

function startAllScheduled() {
  const allMonitors = [...store.getMonitorsByUser.toString()];
}

module.exports = { performCheck, scheduleMonitor, unscheduleMonitor };
