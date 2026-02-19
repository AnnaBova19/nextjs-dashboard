'use client';

import { State, updateCustomer } from "@/app/lib/actions/customer-actions";
import { CustomerForm } from "@/app/dashboard/customers/_lib/types";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ImageUploader from "@/app/dashboard/customers/_components/image-uploader";
import { Label } from "@/app/ui/shared/label";
import { AtSymbolIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditCustomerForm({
  customer
}: {
  customer: CustomerForm;
}) {
  const router = useRouter();
  const [isOldImageRemoved, setIsOldImageRemoved] = useState(false);
  
  const initialState: State = { success: false, errors: {}, message: null };
  const updateCustomerWithId = updateCustomer.bind(null, customer.id, isOldImageRemoved);
  const [state, formAction, isPending] = useActionState(updateCustomerWithId, initialState);

  const onRemove = () => { setIsOldImageRemoved(true) }

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      setTimeout(() => {
        router.push('/dashboard/customers');
      }, 100);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer image */}
        <div className="mb-4">
          <ImageUploader state={state} imageUrl={customer.image_url} onRemove={onRemove} />
        </div>

        {/* Customer first name */}
        <div className="mb-4">
          <Label htmlFor="firstName" required>
            First Name
          </Label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                defaultValue={customer.first_name}
                placeholder="Enter customer first name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="firstName-error"
                //required // client side validation to ensure an amount is entered
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="firstName-error" aria-live="polite" aria-atomic="true">
            {state.errors?.firstName &&
              state.errors.firstName.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Customer last name */}
        <div className="mb-4">
          <Label htmlFor="lastName" required>
            Last Name
          </Label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                defaultValue={customer.last_name}
                placeholder="Enter customer last name"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="lastName-error"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="lastName-error" aria-live="polite" aria-atomic="true">
            {state.errors?.lastName &&
              state.errors.lastName.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Customer email */}
        <div className="mb-4">
          <Label htmlFor="email" required>
            Email
          </Label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email}
                placeholder="Enter customer email"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="email-error"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {!state.success && state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>Edit Customer</Button>
      </div> 
    </form>
  );
}