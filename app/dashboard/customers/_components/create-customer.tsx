'use client';

import { createCustomer } from "@/app/lib/actions/customer-actions";
import Link from "next/link";
import ImageUploader from "@/app/dashboard/customers/_components/image-uploader";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { CreateCustomerSchema } from "../_lib/schemas";

export default function CreateCustomerForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(CreateCustomerSchema),
    defaultValues: { imageFile: undefined, firstName: "", lastName: "", email: "" },
  });

  async function onSubmit(data: z.infer<typeof CreateCustomerSchema>) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'imageFile') {
        formData.append(key, value as string);
      }
    });
    if (data.imageFile instanceof File) {
      formData.append('imageFile', data.imageFile);
    }

    const result = await createCustomer(formData);
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
      <form id="create-customer-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="imageFile"
            control={form.control}
            render={({ field, fieldState }) => (
            <ImageUploader 
              label="Upload Image"
              required
              value={field.value}
              onChange={field.onChange}
              onRemove={() => {}}
              error={fieldState.error?.message}
            />
            )}
          />

          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required htmlFor="create-customer-form-firstName">
                First Name
              </FieldLabel>
              <Input
                {...field}
                id="create-customer-form-firstName"
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
              <FieldLabel required htmlFor="create-customer-form-lastName">
                Last Name
              </FieldLabel>
              <Input
                {...field}
                id="create-customer-form-lastName"
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
              <FieldLabel required htmlFor="create-customer-form-email">
                Email
              </FieldLabel>
              <Input
                {...field}
                id="create-customer-form-email"
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
        <Button type="submit" form="create-customer-form" disabled={form.formState.isSubmitting}>
          Save Changes
        </Button>
      </Field>
    </div>
  );
}