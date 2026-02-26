import { lusitana } from '@/app/ui/fonts';
import { TableSkeleton } from '@/app/ui/shared/skeletons';
import { Metadata } from 'next';
import { Suspense } from 'react';
import MembersSection from '@/app/dashboard/members/_components/members-section';
import Search from '@/app/ui/shared/search';
import { CreateMember } from './_components/buttons';
 
export const metadata: Metadata = {
  title: 'Members',
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
        <h1 className={`${lusitana.className} text-2xl`}>Members</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
        <Search placeholder="Search members..." />
        <CreateMember />
      </div>
      <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
        <MembersSection query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}