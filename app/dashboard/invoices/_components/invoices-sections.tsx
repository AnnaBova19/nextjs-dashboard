import { fetchFilteredInvoices, fetchInvoicesPages } from "@/app/lib/data"
import { EmptyState } from "@/app/ui/shared/empty-state";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline"
import DynamicPagination from "@/app/ui/shared/pagination";
import InvoicesTable from "@/app/dashboard/invoices/_components/table";

export default async function InvoicesSection({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [invoices, totalPages] = await Promise.all([
    fetchFilteredInvoices(query, currentPage),
    fetchInvoicesPages(query),
  ]);

  if (!invoices || invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices found"
        description="Looks like you haven't added any invoice yet."
        icon={<DocumentDuplicateIcon />}
        ctaText="Create Invoice"
        ctaLink="/dashboard/invoices/create"
      />
    )
  }

  return (
    <>
      <InvoicesTable invoices={invoices} />
      <div className="mt-5 flex w-full justify-center">
        <DynamicPagination totalPages={totalPages} />
      </div>
    </>
  )
}
