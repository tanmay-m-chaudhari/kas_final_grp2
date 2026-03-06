const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const store = require("../models/store");
const requireAuth = require("../middleware/auth");

router.use(requireAuth);

const validateProject = (req, res, next) => {
  const project = store.getProjectById(req.params.projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });
  if (!project.members.includes(req.user.id)) return res.status(403).json({ error: "Forbidden" });
  req.project = project;
  next();
};

router.post(
  "/projects/:projectId/tasks",
  validateProject,
  [body("title").isLength({ min: 1, max: 200 })],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const task = store.createTask(req.params.projectId, req.user.id, req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }
);

router.patch("/projects/:projectId/tasks/:taskId", validateProject, (req, res, next) => {
  try {
    const task = store.getTaskById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.projectId !== req.params.projectId) return res.status(400).json({ error: "Task/project mismatch" });

    const allowed = ["title", "description", "status", "priority", "assigneeId", "dueDate", "labels"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.status && !store.columns.includes(updates.status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = store.updateTask(req.params.taskId, updates);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/projects/:projectId/tasks/:taskId", validateProject, (req, res, next) => {
  try {
    const task = store.getTaskById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    store.deleteTask(req.params.taskId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
