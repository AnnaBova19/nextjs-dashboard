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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema } from "../_lib/schemas";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskPriority, TaskStatus } from "../_lib/enums";
import { TASK_PRIORITY_MAP, TASK_STATUS_MAP, taskPriorityOptions, taskStatusOptions } from "../_lib/constants";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

export default function CreateTaskModal({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      due_date: undefined,
      project_id: projectId,
    },
  });

  function onSubmit(data: z.infer<typeof TaskSchema>) {
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
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Fill out the form below to create a new task.
        </DialogDescription>
        <form id="create-task-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="create-task-form-title">
                  Title
                </FieldLabel>
                <Input
                  {...field}
                  id="create-task-form-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter task title"
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
                <FieldLabel htmlFor="create-task-form-description">
                  Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="create-task-form-description"
                    placeholder="Enter task description"
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

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="create-task-form-status">
                  Status
                </FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={TASK_STATUS_MAP[field.value]?.variant || 'outline'} className="!w-fit justify-between">
                      {TASK_STATUS_MAP[field.value]?.label || "Select Status"}
                      <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40" align="start">
                    {taskStatusOptions.map((status) => (
                      <DropdownMenuItem
                        key={status.value}
                        onSelect={() => field.onChange(status.value)}>
                        {status.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
              )}
            />

            <Controller
              name="priority"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedPriority = TASK_PRIORITY_MAP[field.value as TaskPriority];
                const SelectedIcon = selectedPriority?.icon;
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-task-form-priority">
                      Priority
                    </FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="!w-40 justify-between">
                          <span className="flex items-center gap-2">
                            {SelectedIcon && (
                              <SelectedIcon className={`h-4 w-4 ${selectedPriority.color}`} />
                            )}
                            {selectedPriority?.label || "Select Priority"}
                          </span>
                          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="start">
                        {taskPriorityOptions.map((priority) => {
                          const PriorityIcon = priority.icon;
                          return (
                            <DropdownMenuItem
                              key={priority.value}
                              onSelect={() => field.onChange(priority.value)}>
                              {PriorityIcon && <PriorityIcon className={`h-4 w-4 ${priority.color}`} />}
                              <span>{priority.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
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
            <Button type="submit" form="create-task-form">
              Save Changes
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}