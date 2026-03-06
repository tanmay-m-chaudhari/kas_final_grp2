const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { requireApiAuth, issueAdminToken } = require("../middleware/apiAuth");
const { evictOlderThan, getStats } = require("../storage/logStore");
const config = require("../config");

const admins = new Map([["admin", bcrypt.hashSync("changeme", 10)]]);

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const hash = admins.get(username);
    if (!hash || !(await bcrypt.compare(password, hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ token: issueAdminToken(username) });
  } catch (err) { next(err); }
});

router.post("/evict", requireApiAuth, (req, res) => {
  const hours = parseInt(req.body.hours, 10) || config.retentionHours;
  const evicted = evictOlderThan(hours);
  res.json({ evicted, remaining: getStats().total });
});

module.exports = router;
