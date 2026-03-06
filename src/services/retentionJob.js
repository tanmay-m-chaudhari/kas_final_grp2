const { evictOlderThan } = require("../storage/logStore");
const config = require("../config");

function startRetentionJob() {
  const intervalMs = 60 * 60 * 1000;
  setInterval(() => {
    evictOlderThan(config.retentionHours);
  }, intervalMs);
}

module.exports = { startRetentionJob };
