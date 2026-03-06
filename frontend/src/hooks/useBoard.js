import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBoard } from "../api/projects";
import { updateTask, createTask, deleteTask } from "../api/tasks";

export function useBoard(projectId) {
  const qc = useQueryClient();

  const boardQuery = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => fetchBoard(projectId),
    enabled: !!projectId,
  });

  const moveTask = useMutation({
    mutationFn: ({ taskId, status }) => updateTask(projectId, taskId, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board", projectId] }),
  });

  const addTask = useMutation({
    mutationFn: (data) => createTask(projectId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board", projectId] }),
  });

  const removeTask = useMutation({
    mutationFn: (taskId) => deleteTask(projectId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["board", projectId] }),
  });

  return { boardQuery, moveTask, addTask, removeTask };
}
