'use client';

import { updateCustomer } from "@/app/lib/actions/customer-actions";
import { CustomerForm } from "@/app/dashboard/customers/_lib/types";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import ImageUploader from "@/app/dashboard/customers/_components/image-uploader";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { UpdateCustomerSchema } from "../_lib/schemas";

export default function EditCustomerForm({
  customer
}: {
  customer: CustomerForm;
}) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(UpdateCustomerSchema),
    defaultValues: {
      imageFile: undefined,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      oldImageUrl: customer.image_url,
      isOldImageRemoved: false,
    },
  });

  async function onSubmit(data: z.infer<typeof UpdateCustomerSchema>) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'imageFile') {
        formData.append(key, value as string);
      }
    });
    if (data.imageFile instanceof File) {
      formData.append('imageFile', data.imageFile);
    }

    const result = await updateCustomer(customer.id, formData);
    if (result.success) {
      toast.success(result.message);
      router.push('/dashboard/customers');
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
      <form id="update-customer-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="imageFile"
            control={form.control}
            render={({ field, fieldState }) => (
            <ImageUploader 
              label="Upload Image"
              required
              imageUrl={customer.image_url}
              value={field.value}
              error={fieldState.error?.message}
              onChange={(file) => {
                field.onChange(file);
              }}
              onRemove={() => {
                form.setValue("isOldImageRemoved", true, { shouldValidate: true });
                field.onChange(null);
              }}
            />
            )}
          />

          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required htmlFor="update-customer-form-firstName">
                First Name
              </FieldLabel>
              <Input
                {...field}
                id="update-customer-form-firstName"
                aria-invalid={fieldState.invalid}
                placeholder="Enter customer first name"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
            )}
          />

          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required htmlFor="update-customer-form-lastName">
                Last Name
              </FieldLabel>
              <Input
                {...field}
                id="update-customer-form-lastName"
                aria-invalid={fieldState.invalid}
                placeholder="Enter customer last name"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
            )}
          />


          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required htmlFor="update-customer-form-email">
                Email
              </FieldLabel>
              <Input
                {...field}
                id="update-customer-form-email"
                aria-invalid={fieldState.invalid}
                placeholder="Enter customer email"
                autoComplete="off"
              />
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
          href="/dashboard/customers"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="update-customer-form" disabled={form.formState.isSubmitting}>
          Save Changes
        </Button>
      </Field>
    </div>
  );
}