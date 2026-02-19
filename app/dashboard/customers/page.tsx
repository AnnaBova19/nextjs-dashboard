import { lusitana } from '@/app/ui/fonts';
import { TableSkeleton } from '@/app/ui/shared/skeletons';
import { Metadata } from 'next';
import { Suspense } from 'react';
import CustomersSection from '@/app/dashboard/customers/_components/customers-section';
import Search from '@/app/ui/shared/search';
import { CreateCustomer } from './_components/buttons';
 
export const metadata: Metadata = {
  title: 'Customers',
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
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
        <Search placeholder="Search customers..." />
        <CreateCustomer />
      </div>
      <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
        <CustomersSection query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}