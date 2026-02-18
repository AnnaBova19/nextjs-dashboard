import { fetchFilteredProjects, fetchProjetcsPages } from "@/app/lib/data";
import { EmptyState } from "@/app/ui/shared/empty-state";
import Search from "@/app/ui/shared/search";
import { FolderIcon } from "lucide-react";

export default async function ProjectsSection({
  query,
  currentPage,
}: {
  query: string
  currentPage: number
}) {
  const [projects, totalPages] = await Promise.all([
    fetchFilteredProjects(query, currentPage),
    fetchProjetcsPages(query),
  ]);

  if (!projects || !projects.length) {
    return <EmptyState
      title="No projects found"
      description="Looks like you haven't added any projects yet."
      icon={<FolderIcon />}
      ctaText="Create Project"
    />;
  }

  return (
    <>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
        <Search placeholder="Search projects..." />
      </div>
    </>
  )
}