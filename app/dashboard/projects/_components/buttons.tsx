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
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Project } from '@/app/dashboard/projects/_lib/types';
import { ProjectStatus } from '../_lib/enums';

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

export function CreateTask({ onModalOpen }: { onModalOpen: () => void}) {
  return (
    <Button
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      onClick={() => onModalOpen()}
    >
      <span className="hidden md:block">Create Task</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Button>
  );
}
