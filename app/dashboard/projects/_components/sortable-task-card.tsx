'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../_lib/types";
import { TaskCard } from "./task-card";

export default function SortableTaskCard({
  task,
  onEdit,
  onDeleteConfirm,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDeleteConfirm: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} suppressHydrationWarning>
      <TaskCard task={task} onEdit={onEdit} onDeleteConfirm={onDeleteConfirm} />
    </div>
  );
}