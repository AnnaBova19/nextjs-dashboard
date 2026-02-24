'use client';

import { updateProject } from "@/app/lib/actions/project-actions";
import { Project } from "@/app/dashboard/projects/_lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { toast } from "sonner";
import { ProjectSchema } from "../_lib/schemas";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export default function EditProjectModal({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm({
    resolver: zodResolver(ProjectSchema),
    defaultValues: { name: project.name, description: project.description },
  });

  async function onSubmit(data: z.infer<typeof ProjectSchema>) {
    const result = await updateProject(project.id, data);
    if (result.success) {
      toast.success(result.message);
      onOpenChange(false);
      form.reset();
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

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Update your project’s details here.
        </DialogDescription>
        <form id="update-project-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required htmlFor="update-project-form-name">
                  Title
                </FieldLabel>
                <Input
                  {...field}
                  id="update-project-form-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter project name"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required htmlFor="update-project-form-description">
                  Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="update-project-form-description"
                    placeholder="Enter project description"
                    rows={6}
                    className="min-h-24 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length}/255 characters
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter className="mt-6">
          <Field orientation="horizontal" className="justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </DialogClose>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit" form="update-project-form" disabled={form.formState.isSubmitting}>
              Save Changes
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}