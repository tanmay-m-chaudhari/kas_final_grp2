const router = require("express").Router();
const { z } = require("zod");
const store = require("../models/store");
const { performCheck, scheduleMonitor, unscheduleMonitor } = require("../services/checker");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

const MonitorSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  method: z.enum(["GET", "POST", "HEAD"]).default("GET"),
  intervalSeconds: z.number().int().min(30).max(86400).default(60),
  timeoutMs: z.number().int().min(1000).max(30000).default(10000),
  expectedStatusCode: z.number().int().default(200),
  headers: z.record(z.string()).default({}),
});

router.get("/", (req, res) => {
  res.json(store.getMonitorsByUser(req.user.id));
});

router.post("/", (req, res, next) => {
  const parse = MonitorSchema.safeParse(req.body);
  if (!parse.success) return res.status(422).json({ errors: parse.error.flatten() });
  try {
    const monitor = store.createMonitor(req.user.id, parse.data);
    scheduleMonitor(monitor);
    res.status(201).json(monitor);
  } catch (err) { next(err); }
});

router.get("/:id", (req, res) => {
  const monitor = store.getMonitorById(req.params.id);
  if (!monitor) return res.status(404).json({ error: "Monitor not found" });
  if (monitor.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  res.json(monitor);
});

router.patch("/:id", (req, res, next) => {
  try {
    const monitor = store.getMonitorById(req.params.id);
    if (!monitor) return res.status(404).json({ error: "Monitor not found" });
    if (monitor.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const updated = store.updateMonitor(req.params.id, req.body);
    if (updated.enabled) scheduleMonitor(updated);
    else unscheduleMonitor(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", (req, res, next) => {
  try {
    const monitor = store.getMonitorById(req.params.id);
    if (!monitor) return res.status(404).json({ error: "Monitor not found" });
    if (monitor.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    unscheduleMonitor(req.params.id);
    store.deleteMonitor(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

router.get("/:id/results", (req, res) => {
  const monitor = store.getMonitorById(req.params.id);
  if (!monitor) return res.status(404).json({ error: "Monitor not found" });
  if (monitor.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  res.json(store.getCheckResults(req.params.id, limit));
});

router.post("/:id/check-now", async (req, res, next) => {
  try {
    const monitor = store.getMonitorById(req.params.id);
    if (!monitor) return res.status(404).json({ error: "Monitor not found" });
    if (monitor.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const result = await performCheck(monitor);
    res.json(result);
  } catch (err) { next(err); }
});

router.get("/:id/incidents", (req, res) => {
  const monitor = store.getMonitorById(req.params.id);
  if (!monitor) return res.status(404).json({ error: "Monitor not found" });
  if (monitor.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  res.json(store.getIncidentsByMonitor(req.params.id));
});

module.exports = router;
