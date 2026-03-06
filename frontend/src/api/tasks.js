import client from "./client";

export const createTask = (projectId, data) =>
  client.post(`/projects/${projectId}/tasks`, data).then((r) => r.data);

export const updateTask = (projectId, taskId, data) =>
  client.patch(`/projects/${projectId}/tasks/${taskId}`, data).then((r) => r.data);

export const deleteTask = (projectId, taskId) =>
  client.delete(`/projects/${projectId}/tasks/${taskId}`);
