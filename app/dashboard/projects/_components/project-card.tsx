import { Project } from "@/app/dashboard/projects/_lib/types";
import { format } from "date-fns";
import { ProjectAction } from "./buttons";
import { ProjectStatus } from "@/app/dashboard/projects/_lib/enums";

export default function ProjectCard({
  project,
  onEdit,
}: {
  project: Project;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg">
      <div className="flex justify-between items-center">
        <div className="font-semibold">
          {project.name}
        </div>
        <ProjectAction project={project} onEdit={onEdit} />
      </div>
      <div className="text-sm line-clamp-4">
        {project.description}
      </div>
      <div className="text-xs text-gray-500">
        {project.status === ProjectStatus.ARCHIVED && project.archived_at ? (
          <>Archived: {format(new Date(project.archived_at), "MMM d, yyyy")}</>
        ) : (
          <>Created: {format(new Date(project.created_at), "MMM d, yyyy")}</>
        )}
      </div>
    </div>
  );
};