import { fetchFilteredProjects, fetchProjectsPages } from "@/app/lib/actions/project-actions";
import ProjectsEmptyState from "./projects-empty-state";
import ProjectsList from "./projects-list";
import { ProjectStatus } from "../_lib/enums";

export default async function ProjectsSectionTabContent({
  query,
  currentPage,
  status,
}: {
  query: string;
  currentPage: number;
  status: ProjectStatus;
}) {
  const [projects, totalPages] = await Promise.all([
    fetchFilteredProjects(query, currentPage, status),
    fetchProjectsPages(query, status),
  ]);

  if (!projects || !projects.length) {
    return <ProjectsEmptyState
      title={status === ProjectStatus.ACTIVE ? "No active projects found" : "No archived projects found"}
      description={
        status === ProjectStatus.ACTIVE
        ? "Looks like you haven't added any projects yet."
        : "Looks like you haven't archived any projects yet."
      }
      ctaText={status === ProjectStatus.ACTIVE ? "Create Project" : ""}
    />;
  }

  return (
    <ProjectsList projects={projects} totalPages={totalPages} />
  );
}