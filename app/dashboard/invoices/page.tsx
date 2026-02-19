import { lusitana } from '@/app/ui/fonts';
import { TableSkeleton } from '@/app/ui/shared/skeletons';
import { Suspense } from 'react';
import { Metadata } from 'next';
import InvoicesSection from '@/app/dashboard/invoices/_components/invoices-sections';
import Search from '@/app/ui/shared/search';
import { CreateInvoice } from './_components/buttons';
 
export const metadata: Metadata = {
  title: 'Invoices',
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
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
        <InvoicesSection query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}