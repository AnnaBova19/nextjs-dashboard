'use client';

import { Button } from "@/components/ui/button";
import { Project } from "../_lib/types";
import { ArchiveBoxIcon, ArrowUpOnSquareIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useState, useTransition } from "react";
import EditProjectModal from "./edit-project-modal";
import { ProjectStatus } from "../_lib/enums";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner";
import { updateProjectStatus } from "@/app/lib/actions/project-actions";

export default function ProjectPageButtons({
  project,
}: {
  project: Project;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <>
      <div className="flex justify-end gap-2">
        {project.status === ProjectStatus.ACTIVE && ( 
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-[36px]"
                onClick={() => setIsModalOpen(true)}>
                <PencilIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-[36px]"
                onClick={handleStatusChange}
                disabled={isPending}>
                  {project.status === ProjectStatus.ACTIVE ? (
                    <ArchiveBoxIcon />
                  ) : (
                    <ArrowUpOnSquareIcon />
                  )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {project.status === ProjectStatus.ACTIVE ? 'Archive' : 'Unarchive'}
              </p>
            </TooltipContent>
          </Tooltip>
      </div>

      <EditProjectModal
        project={project}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}