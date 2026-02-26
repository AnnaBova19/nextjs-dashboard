import Image from 'next/image';
import { DeleteMember, UpdateMember } from '@/app/dashboard/members/_components/buttons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormattedMembersTable } from '@/app/dashboard/members/_lib/types';

export default async function MembersTable({ members }: { members: Array<FormattedMembersTable>}) {

  return (
    <div className="mt-6 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
            {/* mobile version */}
            <div className="md:hidden">
              {members?.map((member) => (
                <div
                  key={member.id}
                  className="mb-2 w-full rounded-md bg-white p-4"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex items-center">
                        <div className="flex items-center gap-3">
                          <Image
                            src={member.image_url}
                            alt={`${member.first_name} ${member.last_name}'s profile picture`}
                            width={28}
                            height={28}
                            className="rounded-full object-cover"
                            style={{ width: '28px', height: '28px', 'minWidth': '28px' }}
                          />
                          <p>{member.first_name} {member.last_name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between border-b py-5">
                    <div className="flex w-1/2 flex-col">
                      <p className="text-xs">Pending</p>
                      <p className="font-medium">{member.total_pending}</p>
                    </div>
                    <div className="flex w-1/2 flex-col">
                      <p className="text-xs">Paid</p>
                      <p className="font-medium">{member.total_paid}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 text-sm">
                    <p>{member.total_invoices} invoices</p>
                    <div className="flex justify-end gap-2">
                      <UpdateMember id={member.id} />
                      <DeleteMember member={member} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* desktop version */}
            <Table className="hidden min-w-full text-gray-900 md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Invoices</TableHead>
                  <TableHead>Total Pending</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>
                    <span className="sr-only">Edit</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={member.image_url}
                          alt={`${member.first_name} ${member.last_name}'s profile picture`}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                          style={{ width: '28px', height: '28px', 'minWidth': '28px' }}
                        />
                        <p>{member.first_name} {member.last_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3">{member.email}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3">{member.total_invoices}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3">{member.total_pending}</TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3">{member.total_paid}</TableCell>
                    <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <UpdateMember id={member.id} />
                        <DeleteMember member={member} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
