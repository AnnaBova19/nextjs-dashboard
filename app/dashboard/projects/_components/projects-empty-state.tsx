"use client";

import { EmptyState } from "@/app/ui/shared/empty-state";
import { FolderIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CreateProjectModal from "./create-project-modal";

export default function ProjectsEmptyState({
  title,
  description,
  ctaText,
}: {
  title: string;
  description: string;
  ctaText?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <EmptyState
        title={title}
        description={description}
        icon={<FolderIcon />}
        ctaText={ctaText}
        ctaAction={() => setIsModalOpen(true)}
      />

      <CreateProjectModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}