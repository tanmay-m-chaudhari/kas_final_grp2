const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const store = require("../models/store");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

router.get("/", (req, res) => {
  const projects = store.getProjectsByUser(req.user.id);
  res.json(projects);
});

router.post(
  "/",
  [body("name").isLength({ min: 1, max: 100 })],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const project = store.createProject(req.user.id, req.body.name, req.body.description || "");
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id", (req, res) => {
  const project = store.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  if (!project.members.includes(req.user.id)) return res.status(403).json({ error: "Forbidden" });
  res.json(project);
});

router.get("/:id/board", (req, res) => {
  const project = store.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  if (!project.members.includes(req.user.id)) return res.status(403).json({ error: "Forbidden" });

  const tasks = store.getTasksByProject(req.params.id);
  const board = {};
  for (const col of store.columns) {
    board[col] = tasks.filter((t) => t.status === col);
  }
  res.json({ project, board, columns: store.columns });
});

module.exports = router;
