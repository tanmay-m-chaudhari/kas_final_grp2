const router = require("express").Router();
const ingestAuth = require("../middleware/ingestAuth");
const { parseBatch, parseLogEntry } = require("../parsers/logParser");
const { appendLogs } = require("../storage/logStore");

router.post("/batch", ingestAuth, (req, res) => {
  const parsed = parseBatch(req.body);
  if (!parsed.ok) return res.status(422).json({ error: "Validation failed", details: parsed.errors });

  const count = appendLogs(parsed.data.logs, parsed.data.source);
  res.status(202).json({ accepted: count });
});

router.post("/single", ingestAuth, (req, res) => {
  const parsed = parseLogEntry(req.body);
  if (!parsed.ok) return res.status(422).json({ error: "Validation failed", details: parsed.errors });

  appendLogs([parsed.data], req.body.source);
  res.status(202).json({ accepted: 1 });
});

module.exports = router;
