import Image from 'next/image';
import { UpdateInvoice, DeleteInvoice } from '@/app/dashboard/invoices/_components/buttons';
import InvoiceStatus from '@/app/dashboard/invoices/_components/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { InvoicesTableType } from '@/app/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function InvoicesTable({ invoices }: { invoices: Array<InvoicesTableType> }) {

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* mobile version */}
          <div className="md:hidden">
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={invoice.image_url}
                        alt={`${invoice.first_name} ${invoice.last_name}'s profile picture`}
                        width={28}
                        height={28}
                        className="mr-2 rounded-full object-cover"
                        style={{ width: '28px', height: '28px', 'minWidth': '28px' }}
                      />
                      <p>{invoice.first_name} {invoice.last_name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{invoice.email}</p>
                  </div>
                  <InvoiceStatus status={invoice.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(invoice.amount)}
                    </p>
                    <p>{formatDateToLocal(invoice.date)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateInvoice id={invoice.id} />
                    <DeleteInvoice id={invoice.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* desktop table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Edit</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={invoice.image_url}
                        alt={`${invoice.first_name} ${invoice.last_name}'s profile picture`}
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                        style={{ width: '28px', height: '28px', 'minWidth': '28px' }}
                      />
                      <p>{invoice.first_name} {invoice.last_name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-3">{invoice.email}</TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-3">{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-3">{formatDateToLocal(invoice.date)}</TableCell>
                  <TableCell className="whitespace-nowrap px-3 py-3"><InvoiceStatus status={invoice.status} /></TableCell>
                  <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
