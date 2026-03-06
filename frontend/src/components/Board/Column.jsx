import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "../Task/TaskCard";
import clsx from "clsx";

const COLUMN_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const COLUMN_COLORS = {
  todo: "border-slate-300",
  in_progress: "border-blue-400",
  review: "border-yellow-400",
  done: "border-green-400",
};

export default function Column({ id, tasks, onDeleteTask, onAddTask }) {
  return (
    <div className={clsx("flex flex-col w-72 shrink-0 bg-slate-100 rounded-xl border-t-4", COLUMN_COLORS[id])}>
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="font-semibold text-sm text-slate-700">{COLUMN_LABELS[id]}</h3>
        <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={clsx(
              "flex-1 min-h-24 px-2 pb-2 space-y-2",
              snapshot.isDraggingOver && "bg-blue-50 rounded-b-xl"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onDelete={onDeleteTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <button
        onClick={() => onAddTask(id)}
        className="mx-2 mb-2 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
      >
        + Add task
      </button>
    </div>
  );
}
