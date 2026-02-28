'use client';

import { deleteProject, updateProjectStatus } from '@/app/lib/actions/project-actions';
import { EllipsisVerticalIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Project, Task } from '@/app/dashboard/projects/_lib/types';
import { ProjectStatus } from '../_lib/enums';
import CreateTaskModal from './create-task-modal';
import { MemberField } from '../../members/_lib/types';

export function ProjectAction({
  project,
  onEdit,
}: {
  project: Project;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const newStatus =
      project.status === ProjectStatus.ARCHIVED ? ProjectStatus.ACTIVE : ProjectStatus.ARCHIVED;

    startTransition(async () => {
      try {
        await updateProjectStatus(project.id, newStatus);
        toast.success(
          newStatus === ProjectStatus.ARCHIVED
            ? "Project was successfully archived"
            : "Project was successfully unarchived"
        );
      } catch {
        toast.error("Failed to update project");
      }
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[36px]">
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {project.status === ProjectStatus.ACTIVE && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={handleStatusChange}
          disabled={isPending}
        >
          {project.status === ProjectStatus.ARCHIVED ? (
            <>Unarchive</>
          ) : (
            <>Archive</>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DeleteProject({ id }: { id: string }) {
  const deleteProjectWithId = deleteProject.bind(null, id);

  return (
    <form action={deleteProjectWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function CreateTask({
  projectId,
  members,
}: {
  projectId: string;
  members: MemberField[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <Button
        className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="hidden md:block">Create Task</span>{' '}
        <PlusIcon className="h-5 md:ml-4" />
      </Button>

      <CreateTaskModal
        projectId={projectId}
        members={members}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

export function TaskAction({
  task,
  onEdit,
  onDeleteConfirm,
}: {
  task: Task;
  onEdit: () => void;
  onDeleteConfirm: () => void;
}) {
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[36px]"
          onClick={(e) => e.stopPropagation()}>
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteConfirm();
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
