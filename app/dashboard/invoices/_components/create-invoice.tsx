'use client';

import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Button, buttonVariants } from "@/components/ui/button";
import { createInvoice } from '@/app/lib/actions/invoice-actions';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { CustomerField } from '@/app/dashboard/customers/_lib/types';
import { InvoiceSchema } from '../_lib/schemas';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CreateInvoiceForm({
  customers
}: {
  customers: CustomerField[]
}) {
  const router = useRouter();

  const CreateInvoice = InvoiceSchema.omit({ id: true, created_at: true });
  const form = useForm({
    resolver: zodResolver(CreateInvoice),
    defaultValues: { customerId: "", amount: "" as any, status: undefined },
  });

  async function onSubmit(data: z.infer<typeof CreateInvoice>) {
    const result = await createInvoice(data);
    if (result.success) {
      toast.success(result.message);
      router.push('/dashboard/invoices');
    } else {
      toast.error(result.message);
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: "server",
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        });
      }
    }
  }

  return (
    <div className="rounded-md border border-gray-200 p-4 md:p-6">
      <form id="create-invoice-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="customerId"
            control={form.control}
            render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required htmlFor="create-invoice-form-customerId">
                Choose customer
              </FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="create-invoice-form-customerId"
                  aria-invalid={fieldState.invalid}
                  className="min-w-[120px]"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
            )}
          />

          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required htmlFor="create-invoice-form-amount">
                  Choose an amount
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="create-invoice-form-amount"
                    type="number"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter USD amount"
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-start">
                    <CurrencyDollarIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required htmlFor="create-invoice-form-status">
                  Set the invoice status
                </FieldLabel>
                <RadioGroup 
                  className="flex flex-row items-center"
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <Field orientation="horizontal">
                    <RadioGroupItem value="pending" id="pending" aria-invalid={fieldState.invalid} />
                    <FieldLabel htmlFor="pending" className="font-normal">
                      <div className='flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600'>
                        Pending <ClockIcon className="h-4 w-4" />
                      </div>
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem value="paid" id="paid" aria-invalid={fieldState.invalid} />
                    <FieldLabel htmlFor="paid" className="font-normal">
                      <div className='flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white'>
                        Paid <CheckIcon className="h-4 w-4" />
                      </div>
                    </FieldLabel>
                  </Field>
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <Field orientation="horizontal" className="justify-end mt-6">
        <Link
          href="/dashboard/invoices"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="create-invoice-form" disabled={form.formState.isSubmitting}>
          Save Changes
        </Button>
      </Field>
    </div>
  );
}
