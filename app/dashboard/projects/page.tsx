import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { TableSkeleton } from '@/app/ui/shared/skeletons';
import Search from '@/app/ui/shared/search';
import { CreateProjectButton } from '@/app/dashboard/projects/_components/create-project-button';
import ProjectsTabs from '@/app/dashboard/projects/_components/projects-tabs';
import ProjectsSectionTabContent from '@/app/dashboard/projects/_components/projects-section-tab-content';
import { ProjectStatus } from './_lib/enums';
 
export const metadata: Metadata = {
  title: 'Projects',
};
 
export default async function Page(props: {
  searchParams?: Promise<{
    status?: ProjectStatus;
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const status = searchParams?.status || ProjectStatus.ACTIVE;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Projects</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
        <Search placeholder="Search projects..." />
        <CreateProjectButton />
      </div>
      <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
        <div className="mt-6 flow-root">
          <ProjectsTabs>
            <ProjectsSectionTabContent query={query} currentPage={currentPage} status={status} /> 
          </ProjectsTabs>
        </div>
      </Suspense>
    </div>
  );
};