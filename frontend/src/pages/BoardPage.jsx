import { useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import Column from "../components/Board/Column";
import { useBoard } from "../hooks/useBoard";

export default function BoardPage() {
  const { projectId } = useParams();
  const { boardQuery, moveTask, addTask, removeTask } = useBoard(projectId);
  const [addingTo, setAddingTo] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  if (boardQuery.isLoading) return <div className="p-8 text-slate-500">Loading board…</div>;
  if (boardQuery.isError) return <div className="p-8 text-red-500">Failed to load board.</div>;

  const { board, columns, project } = boardQuery.data;

  function onDragEnd(result) {
    if (!result.destination) return;
    if (result.destination.droppableId === result.source.droppableId) return;
    moveTask.mutate({ taskId: result.draggableId, status: result.destination.droppableId });
  }

  function handleAddTask(columnId) {
    setAddingTo(columnId);
    setNewTaskTitle("");
  }

  function handleSubmitTask(e) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask.mutate({ title: newTaskTitle.trim(), status: addingTo });
    setAddingTo(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <h1 className="text-xl font-bold text-slate-800">{project.name}</h1>
        {project.description && <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>}
      </div>
      <div className="flex-1 overflow-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 p-6 h-full items-start">
            {columns.map((col) => (
              <Column
                key={col}
                id={col}
                tasks={board[col] || []}
                onDeleteTask={(taskId) => removeTask.mutate(taskId)}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {addingTo && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-slate-800 mb-4">New Task</h2>
            <form onSubmit={handleSubmitTask} className="space-y-3">
              <input
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setAddingTo(null)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
