'use client';

import { State, updateProject } from "@/app/lib/actions/project-actions";
import { Project } from "@/app/dashboard/projects/_lib/types";
import { Label } from "@/app/ui/shared/label";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DocumentTextIcon, FolderIcon } from "@heroicons/react/24/outline";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditProjectModal({
  project,
  open,
  onOpenChange,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [descriptionValue, setDescriptionValue] = useState(project.description || "");

  const initialState: State = { success: false, errors: {}, message: null };
  const updateProjectWithId = updateProject.bind(null, project.id);
  const [state, formAction, isPending] = useActionState(updateProjectWithId, initialState);

  useEffect(() => {
    if (!open) {
      state.errors = {};
      state.message = null;
    }
  }, [open]);

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      onOpenChange(false);
      setDescriptionValue("");
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Update your project’s details here.
        </DialogDescription>
        <form action={formAction}>
          {/* Project name */}
          <div className="mb-4">
            <Label htmlFor="name" required>
              Name
            </Label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <Input
                  defaultValue={project.name}
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter project name"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="name-error"
                />
                <FolderIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
            <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name &&
                state.errors.name.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Project description */}
          <div className="mb-4">
            <Label htmlFor="description" required>
              Description
            </Label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <Textarea
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  rows={5}
                  id="description"
                  name="description"
                  placeholder="Enter project description"
                  maxLength={255}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="description-error" />
                <DocumentTextIcon className="pointer-events-none absolute left-3 top-[20px] h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground pointer-events-none">
                  {descriptionValue.length}/{255}
                </span>
              </div>
            </div>
            <div id="description-error" aria-live="polite" aria-atomic="true">
              {state.errors?.description &&
                state.errors.description.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          <div aria-live="polite" aria-atomic="true">
            {!state.success && state.message && <p className="mt-2 text-sm text-red-500">{state.message}</p>}
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}