import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { TableSkeleton } from '@/app/ui/shared/skeletons';
import ProjectsSection from './_components/projects-section';
 
export const metadata: Metadata = {
  title: 'Projects',
};
 
export default async function Page(props: {
    searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Projects</h1>
      </div>
      <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
        <ProjectsSection query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
};