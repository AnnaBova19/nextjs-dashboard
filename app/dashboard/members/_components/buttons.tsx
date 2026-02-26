import { deleteMember } from '@/app/lib/actions/member-actions';
import { MemberForm } from '@/app/dashboard/members/_lib/types';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function CreateMember() {
  return (
    <Link
      href="/dashboard/members/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Member</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateMember({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/members/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteMember({ member }: { member: MemberForm }) {
  const deleteMemberWithId = deleteMember.bind(null, member);

  return (
    <form action={deleteMemberWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
