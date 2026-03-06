const { v4: uuidv4 } = require("uuid");

const users = new Map();
const projects = new Map();
const tasks = new Map();
const columns = ["todo", "in_progress", "review", "done"];

function createUser(username, hashedPassword) {
  const id = uuidv4();
  const user = { id, username, hashedPassword, createdAt: new Date().toISOString() };
  users.set(id, user);
  return user;
}

function getUserByUsername(username) {
  return [...users.values()].find((u) => u.username === username) || null;
}

function getUserById(id) {
  return users.get(id) || null;
}

function createProject(ownerId, name, description) {
  const id = uuidv4();
  const project = {
    id, ownerId, name, description,
    members: [ownerId],
    createdAt: new Date().toISOString(),
  };
  projects.set(id, project);
  return project;
}

function getProjectsByUser(userId) {
  return [...projects.values()].filter((p) => p.members.includes(userId));
}

function getProjectById(id) {
  return projects.get(id) || null;
}

function createTask(projectId, creatorId, data) {
  const id = uuidv4();
  const task = {
    id, projectId, creatorId,
    title: data.title,
    description: data.description || "",
    status: data.status || "todo",
    priority: data.priority || "medium",
    assigneeId: data.assigneeId || null,
    dueDate: data.dueDate || null,
    labels: data.labels || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.set(id, task);
  return task;
}

function getTasksByProject(projectId) {
  return [...tasks.values()].filter((t) => t.projectId === projectId);
}

function getTaskById(id) {
  return tasks.get(id) || null;
}

function updateTask(id, updates) {
  const task = tasks.get(id);
  if (!task) return null;
  Object.assign(task, updates, { updatedAt: new Date().toISOString() });
  return task;
}

function deleteTask(id) {
  return tasks.delete(id);
}

module.exports = {
  createUser, getUserByUsername, getUserById,
  createProject, getProjectsByUser, getProjectById,
  createTask, getTasksByProject, getTaskById, updateTask, deleteTask,
  columns,
};
