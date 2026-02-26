import { fetchMemberById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import EditMemberForm from '@/app/dashboard/members/_components/edit-member';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from 'next/link';
 
export const metadata: Metadata = {
  title: 'Edit Member',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const member = await fetchMemberById(id)
  if (!member) {
    notFound();
  }

  return (
    <main>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/members">Members</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Edit Member
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <EditMemberForm member={member} />
    </main>
  );
}