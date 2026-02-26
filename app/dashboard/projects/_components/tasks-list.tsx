'use client';

import { EmptyState } from "@/app/ui/shared/empty-state";
import { Task } from "../_lib/types";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CreateTaskModal from "./create-task-modal";
import Search from "@/app/ui/shared/search";
import { CreateTask } from "./buttons";
import { TaskStatus } from "../_lib/enums";
import { TaskCard } from "./task-card";
import { MemberField } from "../../members/_lib/types";

export default function TasksList({
  projectId,
  tasks,
  members,
}: {
  projectId: string;
  tasks: Task[];
  members: MemberField[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { status: TaskStatus.TODO, title: "To Do" },
    { status: TaskStatus.IN_PROGRESS, title: "In Progress" },
    { status: TaskStatus.DONE, title: "Done" },
  ];

  return (
    <>
      {(!tasks || !tasks.length) ? (
        <EmptyState
          title="No tasks found"
          description="Looks like you haven't added any task to this project yet."
          icon={<ClipboardDocumentListIcon />}
          ctaText="Create Task"
          ctaAction={() => setIsModalOpen(true)}
        />
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
            <Search placeholder="Search tasks..." />
            <CreateTask onModalOpen={() => setIsModalOpen(true)} />
          </div>
          <div className="flex-auto flex gap-4 w-full overflow-x-auto">
            {columns.map((col) => {
              const columnTasks = tasks.filter((task) => task.status === col.status);
              return (
                <div key={col.status}
                  className="flex-1 w-auto min-w-[280px] rounded-md bg-muted/40 px-4 py-2">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 font-semibold uppercase text-sm text-muted-foreground">
                      <span>{col.title}</span>
                      {!!columnTasks.length ? (
                        <div className="w-fit min-w-[28px] rounded-md bg-gray-200 py-1 px-2 text-center">
                          {columnTasks.length}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3">
                      {!columnTasks.length ? (
                        <div className="text-sm text-muted-foreground">
                          No tasks
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <TaskCard key={task.id} task={task}/>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <CreateTaskModal
        projectId={projectId}
        members={members}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}