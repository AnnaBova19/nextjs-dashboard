'use client';

import { EmptyState } from "@/app/ui/shared/empty-state";
import { Task } from "../_lib/types";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CreateTaskModal from "./create-task-modal";

export default function TasksList({
  tasks,
}: {
  tasks: Task[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        </>
      )}

      <CreateTaskModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}