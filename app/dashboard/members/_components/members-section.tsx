import { fetchMembersPages, fetchFilteredMembers } from "@/app/lib/data"
import { EmptyState } from "@/app/ui/shared/empty-state";
import { UserGroupIcon } from "@heroicons/react/24/outline"
import DynamicPagination from "@/app/ui/shared/pagination";
import MembersTable from "@/app/dashboard/members/_components/table";

export default async function MembersSection({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [members, totalPages] = await Promise.all([
    fetchFilteredMembers(query, currentPage),
    fetchMembersPages(query),
  ]);

  if (!members || members.length === 0) {
    return (
      <EmptyState
        title="No members found"
        description="Looks like you haven't added any member yet."
        icon={<UserGroupIcon />}
        ctaText="Create Member"
        ctaLink="/dashboard/members/create"
      />
    )
  }

  return (
    <>
      <MembersTable members={members} />
      <div className="mt-5 flex w-full justify-center">
        <DynamicPagination totalPages={totalPages} />
      </div>
    </>
  )
}
