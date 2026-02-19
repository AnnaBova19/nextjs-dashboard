import { fetchCustomersPages, fetchFilteredCustomers } from "@/app/lib/data"
import { EmptyState } from "@/app/ui/shared/empty-state";
import { UserGroupIcon } from "@heroicons/react/24/outline"
import DynamicPagination from "@/app/ui/shared/pagination";
import CustomersTable from "@/app/dashboard/customers/_components/table";

export default async function CustomersSection({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [customers, totalPages] = await Promise.all([
    fetchFilteredCustomers(query, currentPage),
    fetchCustomersPages(query),
  ]);

  if (!customers || customers.length === 0) {
    return (
      <EmptyState
        title="No customers found"
        description="Looks like you haven't added any customer yet."
        icon={<UserGroupIcon />}
        ctaText="Create Customer"
        ctaLink="/dashboard/customers/create"
      />
    )
  }

  return (
    <>
      <CustomersTable customers={customers} />
      <div className="mt-5 flex w-full justify-center">
        <DynamicPagination totalPages={totalPages} />
      </div>
    </>
  )
}
