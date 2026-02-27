'use client';

import { useDroppable } from "@dnd-kit/core";
import { TaskStatus } from "../_lib/enums";
import { Task } from "../_lib/types";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableTaskCard from "./sortable-task-card";

export default function TasksColumn({
  columnStatus,
  columnTitle,
  tasks,
}: {
  columnStatus: TaskStatus;
  columnTitle: string;
  tasks: Task[]
}) {
  const { setNodeRef } = useDroppable({
    id: columnStatus
  });

  return (
    <div className="flex-1 w-auto min-w-[280px] rounded-md bg-muted/40 px-4 py-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 font-semibold uppercase text-muted-foreground">
          <span className="text-sm">{columnTitle}</span>
          {!!tasks.length ? (
            <div className="w-fit min-w-[24px] rounded-md bg-gray-200 py-1 px-2 text-xs text-center">
              {tasks.length}
            </div>
          ) : null}
        </div>

        <SortableContext
          id={columnStatus}
          items={tasks}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[400px]">
            {!tasks.length ? (
            <div className="text-sm text-muted-foreground">
              No tasks
            </div>
            ) : (
              <>
                {tasks.map((task) => (
                  <SortableTaskCard key={task.id} task={task}/>
                ))}
              </>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}