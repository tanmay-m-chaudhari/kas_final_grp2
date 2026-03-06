import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import clsx from "clsx";

const PRIORITY_STYLES = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function TaskCard({ task, index, onDelete }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={clsx(
            "bg-white rounded-lg p-3 shadow-sm border border-slate-200 cursor-grab select-none",
            snapshot.isDragging && "shadow-md rotate-1 border-primary-500"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-800 leading-snug flex-1">{task.title}</p>
            <button
              onClick={() => onDelete(task.id)}
              className="text-slate-400 hover:text-red-500 text-xs shrink-0"
            >
              ✕
            </button>
          </div>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", PRIORITY_STYLES[task.priority])}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="text-xs text-slate-400">
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
          </div>
          {task.labels.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {task.labels.map((l) => (
                <span key={l} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
