'use client';

import { Project } from "@/app/dashboard/projects/_lib/types";
import ProjectCard from "./project-card";
import DynamicPagination from "@/app/ui/shared/pagination";
import { useState } from "react";
import EditProjectModal from "./edit-project-modal";

export default function ProjectsList({
  projects,
  totalPages,
}: {
  projects: Array<Project>;
  totalPages: number;
}) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onEdit={() => setSelectedProject(project)}/>
        ))}
      </div>
      <div className="mt-5 flex w-full justify-center">
        <DynamicPagination totalPages={totalPages} />
      </div>

      {selectedProject && (
        <EditProjectModal
          project={selectedProject}
          open={!!selectedProject}
          onOpenChange={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}