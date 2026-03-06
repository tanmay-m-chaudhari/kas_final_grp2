const router = require("express").Router();
const { requireApiAuth } = require("../middleware/apiAuth");
const { queryLogs, getStats } = require("../storage/logStore");

router.use(requireApiAuth);

router.get("/logs", (req, res) => {
  const { service, level, from, to, traceId, page, limit } = req.query;
  const result = queryLogs({
    service, level, from, to, traceId,
    page: parseInt(page, 10) || 1,
    limit: Math.min(parseInt(limit, 10) || 100, 500),
  });
  res.json(result);
});

router.get("/stats", (req, res) => {
  res.json(getStats());
});

router.get("/trace/:traceId", (req, res) => {
  const result = queryLogs({ traceId: req.params.traceId, limit: 500 });
  res.json(result);
});

module.exports = router;
