'use client';

import { EmptyState } from "@/app/ui/shared/empty-state";
import { Task } from "../_lib/types";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CreateTaskModal from "./create-task-modal";
import Search from "@/app/ui/shared/search";
import { CreateTask } from "./buttons";
import { TaskStatus } from "../_lib/enums";

export default function TasksList({
  projectId,
  tasks,
}: {
  projectId: string;
  tasks: Task[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { value: TaskStatus.TODO, title: "To Do" },
    { value: TaskStatus.IN_PROGRESS, title: "In Progress" },
    { value: TaskStatus.DONE, title: "Done" },
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
          <div className="flex-auto grid grid-cols-3 gap-4">
            {columns.map((col) => (
              <div key={col.value} className="flex-1 w-auto rounded-md bg-gray-100 px-4 py-2">
                <div className="flex flex-col gap-4">
                  <div className="font-medium uppercase">{col.title}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <CreateTaskModal projectId={projectId} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}