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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskPriority, TaskStatus } from "../_lib/enums";
import { TASK_PRIORITY_MAP, TASK_STATUS_MAP, taskPriorityOptions, taskStatusOptions } from "../_lib/constants";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, startOfDay } from "date-fns";
import { createTask } from "@/app/lib/actions/task-actions";
import { toast } from "sonner";
import clsx from 'clsx';
import { MemberField } from "../../members/_lib/types";
import { RichEditor } from "@/app/ui/shared/rich-text-editor";
import AssigneeAutocomplete from "./assignee-autocomplete";

export default function CreateTaskModal({
  projectId,
  members,
  open,
  onOpenChange,
}: {
  projectId: string;
  members: MemberField[],
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  
  const form = useForm({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      due_date: undefined,
      project_id: projectId,
      assignee_id: "",
    },
  });

  const handleReset = () => {
    form.reset();
    setResetKey(k => k + 1);
  };

  async function onSubmit(data: z.infer<typeof TaskSchema>) {
    const result = await createTask(data);
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
      <DialogContent className="w-[90%] max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Fill out the form below to create a new task.
        </DialogDescription>
        <div className="no-scrollbar -mx-4 max-h-[75vh] overflow-y-auto px-4">
          <form id="create-task-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required htmlFor="create-task-form-status">
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
                name="assignee_id"
                control={form.control}
                render={({ field, fieldState }) => (
                <AssigneeAutocomplete
                  label="Assignee"
                  value={field.value ?? null}
                  members={members}
                  error={fieldState.error?.message}
                  onChange={field.onChange}
                />
                )}
              />

              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required htmlFor="create-task-form-title">
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
                  <FieldLabel required htmlFor="create-task-form-description">
                    Description
                  </FieldLabel>
                  <RichEditor
                    key={resetKey}
                    value={field.value}
                    placeholder="Enter task description"
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
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
                const SelectedPriorityIcon = selectedPriority?.icon;
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required htmlFor="create-task-form-priority">
                      Priority
                    </FieldLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="!w-40 justify-between">
                          <span className="flex items-center gap-2">
                            {SelectedPriorityIcon && (
                              <SelectedPriorityIcon className={`h-4 w-4 ${selectedPriority.color}`} />
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

              <Controller
                name="due_date"
                control={form.control}
                render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required htmlFor="create-task-form-due-date">
                    Due Date
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={clsx(
                          '!w-40 justify-between',
                          fieldState.invalid && form.formState.isSubmitted && 'border-red-500'
                        )}
                      >
                        {field.value ? (
                          format(field.value, "MMM d, yyyy")
                        ) : (
                          <span className="text-gray-500">Pick a date</span>
                        )}
                        <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={{ before: startOfDay(new Date()) }}
                        defaultMonth={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <DialogFooter className="mt-6">
          <Field orientation="horizontal" className="justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </DialogClose>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" form="create-task-form" disabled={form.formState.isSubmitting}>
              Save Changes
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}