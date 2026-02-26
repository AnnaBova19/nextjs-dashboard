'use client';

import { updateMember } from "@/app/lib/actions/member-actions";
import { MemberForm } from "@/app/dashboard/members/_lib/types";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import ImageUploader from "@/app/dashboard/members/_components/image-uploader";
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
import { UpdateMemberSchema } from "../_lib/schemas";

export default function EditMemberForm({
  member
}: {
  member: MemberForm;
}) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(UpdateMemberSchema),
    defaultValues: {
      imageFile: undefined,
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      oldImageUrl: member.image_url,
      isOldImageRemoved: false,
    },
  });

  async function onSubmit(data: z.infer<typeof UpdateMemberSchema>) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'imageFile') {
        formData.append(key, value as string);
      }
    });
    if (data.imageFile instanceof File) {
      formData.append('imageFile', data.imageFile);
    }

    const result = await updateMember(member.id, formData);
    if (result.success) {
      toast.success(result.message);
      router.push('/dashboard/members');
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
      <form id="update-member-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="imageFile"
            control={form.control}
            render={({ field, fieldState }) => (
            <ImageUploader 
              label="Upload Image"
              required
              imageUrl={member.image_url}
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
              <FieldLabel required htmlFor="update-member-form-firstName">
                First Name
              </FieldLabel>
              <Input
                {...field}
                id="update-member-form-firstName"
                aria-invalid={fieldState.invalid}
                placeholder="Enter member first name"
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
              <FieldLabel required htmlFor="update-member-form-lastName">
                Last Name
              </FieldLabel>
              <Input
                {...field}
                id="update-member-form-lastName"
                aria-invalid={fieldState.invalid}
                placeholder="Enter member last name"
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
              <FieldLabel required htmlFor="update-member-form-email">
                Email
              </FieldLabel>
              <Input
                {...field}
                id="update-member-form-email"
                aria-invalid={fieldState.invalid}
                placeholder="Enter member email"
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
          href="/dashboard/members"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="update-member-form" disabled={form.formState.isSubmitting}>
          Save Changes
        </Button>
      </Field>
    </div>
  );
}