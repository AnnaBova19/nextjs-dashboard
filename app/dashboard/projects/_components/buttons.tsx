'use client';

import { deleteProject, updateProjectStatus } from '@/app/lib/actions/project-actions';
import { EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline';
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

  const handleStatusChange = () => {
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
          <DropdownMenuItem onClick={onEdit}>
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
