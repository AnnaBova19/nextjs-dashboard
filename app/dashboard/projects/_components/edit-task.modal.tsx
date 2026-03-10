import { useState, useTransition } from "react";
import { MemberField } from "../../members/_lib/types";
import { Task } from "../_lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema } from "../_lib/schemas";
import { TaskPriority, TaskStatus } from "../_lib/enums";
import { toast } from "sonner";
import { updateTaskField } from "@/app/lib/actions/task-actions";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { RichEditor } from "@/app/ui/shared/rich-text-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TASK_PRIORITY_MAP, TASK_STATUS_MAP, taskPriorityOptions, taskStatusOptions } from "../_lib/constants";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import AssigneeAutocomplete from "./assignee-autocomplete";

function InlineActions ({
  isPending,
  onCancel,
  onSave,
}: {
  isPending: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-end items-center gap-1">
      <Button type="button" size="sm" variant="outline" disabled={isPending}
        className="w-[32px] h-[32px]" onClick={onCancel}>
        <XMarkIcon />
      </Button>
      <Button type="button" size="sm" disabled={isPending}
        className="w-[32px] h-[32px]" onClick={onSave}>
        <CheckIcon />
      </Button>
    </div>
  );
}

function InlineTitle({
  task,
  onTaskUpdate,
  isEditing,
  onEditingChange,
}: {
  task: Task;
  onTaskUpdate: (task: Task) => void;
  isEditing: boolean;
  onEditingChange: (val: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(TaskSchema.pick({ title: true })),
    defaultValues: { title: task.title },
    mode: "onTouched",
  });

  const handleSave = async () => {
    const isValid = await form.trigger("title");
    if (!isValid) return;

    const value = form.getValues("title");
    onEditingChange(false);
    if (value !== task.title) {
      startTransition(async () => {
        const result = await updateTaskField(task.id, "title", value);
        if (result.success) {
          onTaskUpdate({ ...task, title: value });
        } else {
          toast.error(result.message);
          form.setValue("title", task.title);
        }
      });
    }
  };

  const handleCancel = () => {
    form.setValue("title", task.title);
    form.clearErrors();
    onEditingChange(false);
  };

  if (!isEditing) {
    return (
      <div className="cursor-pointer hover:bg-muted rounded-md px-2 py-2 text-lg font-semibold"
        onClick={() => onEditingChange(true)}>
        {task.title}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              placeholder="Enter task title"
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </>
        )}
      />
      <InlineActions isPending={isPending} onCancel={handleCancel} onSave={handleSave}/>
    </div>
  );
}

function InlineDescription({
  task,
  onTaskUpdate,
  isEditing,
  onEditingChange,
}: {
  task: Task;
  onTaskUpdate: (task: Task) => void;
  isEditing: boolean;
  onEditingChange: (val: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(TaskSchema.pick({ description: true })),
    defaultValues: { description: task.description },
    mode: "onChange",
  });

  const handleSave = async () => {
    const isValid = await form.trigger("description");
    if (!isValid) return;

    const value = form.getValues("description");
    onEditingChange(false);
    if (value !== task.description) {
      startTransition(async () => {
        const result = await updateTaskField(task.id, "description", value);
        if (result.success) {
          onTaskUpdate({ ...task, description: value });
        } else {
          toast.error(result.message);
          form.setValue("description", task.description);
        }
      });
    }
  };

  const handleCancel = () => {
    form.setValue("description", task.description);
    form.clearErrors();
    onEditingChange(false);
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">Description</div>
        <div
          className="cursor-pointer hover:bg-muted rounded px-2 py-2 min-h-[60px] rich-text"
          dangerouslySetInnerHTML={{ 
            __html: task.description || "<p class='text-muted-foreground text-sm'>Add a description...</p>" 
          }}
          onClick={() => onEditingChange(true)}>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium">Description</div>
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <>
            <RichEditor
              value={field.value}
              placeholder="Enter task description"
              invalid={fieldState.invalid}
              onChange={(val) => {
                // strip empty tiptap output
                const isEmpty = val === "<p></p>" || val === "" || val === "<p><br></p>";
                field.onChange(isEmpty ? "" : val);
              }}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </>
        )}
      />
      <InlineActions isPending={isPending} onCancel={handleCancel} onSave={handleSave}/>
    </div>
  );
}

function InlineStatus ({
  task,
  onTaskUpdate,
}: {
  task: Task;
  onTaskUpdate: (task: Task) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<TaskStatus>(task.status);

  const handleSave = async (value: TaskStatus) => {
    if (value === task.status) return;
    setStatus(value);

    startTransition(async () => {
      const result = await updateTaskField(task.id, "status", value);
      if (result.success) {
        onTaskUpdate({ ...task, status: value });
      } else {
        toast.error(result.message);
        setStatus(task.status);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button tabIndex={-1}
          variant={TASK_STATUS_MAP[status]?.variant || 'outline'}
          className="!w-fit justify-between">
          {TASK_STATUS_MAP[status]?.label || "Select Status"}
          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}>
        {taskStatusOptions.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onSelect={() => handleSave(status.value as TaskStatus)}>
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InlineAssignee({
  task,
  members,
  onTaskUpdate,
}: {
  task: Task;
  members: MemberField[];
  onTaskUpdate: (task: Task) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [assigneeId, setAssigneeId] = useState<string | null>(task.assignee_id ?? null);

  const handleSave = async (value: string | null) => {
    if (value === task.assignee_id) return;
    setAssigneeId(value);

    const newAssignee = members.find((m) => m.id === value) ?? null;

    startTransition(async () => {
      const result = await updateTaskField(task.id, "assignee_id", value);
      if (result.success) {
        onTaskUpdate({ ...task, assignee_id: value, assignee: newAssignee ?? undefined  });
      } else {
        toast.error(result.message);
        setAssigneeId(task.assignee_id ?? null);
      }
    });
  };

  return (
    <AssigneeAutocomplete
      value={assigneeId ?? null}
      members={members}
      onChange={(value) => handleSave(value)}
    />
  );
}

function InlinePriority({
  task,
  onTaskUpdate,
}: {
  task: Task;
  onTaskUpdate: (task: Task) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [priority, setPriority] = useState<TaskPriority>(task.priority);

  const selectedPriority = TASK_PRIORITY_MAP[priority as TaskPriority];
  const SelectedPriorityIcon = selectedPriority?.icon;

  const handleSave = async (value: TaskPriority) => {
    if (value === task.priority) return;
    setPriority(value);

    startTransition(async () => {
      const result = await updateTaskField(task.id, "priority", value);
      if (result.success) {
        onTaskUpdate({ ...task, priority: value });
      } else {
        toast.error(result.message);
        setPriority(task.priority);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button tabIndex={-1}
          variant="ghost"
          className="!w-full justify-between border border-transparent hover:border-input data-[state=open]:border-input group">
          <span className="flex items-center gap-2">
            {SelectedPriorityIcon && (
              <SelectedPriorityIcon className={`h-4 w-4 ${selectedPriority.color}`} />
            )}
            {selectedPriority?.label || "Select Priority"}
          </span>
          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50 invisible group-hover:visible data-[state=open]:visible" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
        onCloseAutoFocus={(e) => e.preventDefault()}>
        {taskPriorityOptions.map((priority) => {
          const PriorityIcon = priority.icon;
          return (
            <DropdownMenuItem
              key={priority.value}
              onSelect={() => handleSave(priority.value as TaskPriority)}>
              {PriorityIcon && <PriorityIcon className={`h-4 w-4 ${priority.color}`} />}
              <span>{priority.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function EditProjectModal({
  projectId,
  task,
  members,
  open,
  onTaskUpdate,
  onOpenChange,
}: {
  projectId: string;
  task: Task;
  members: MemberField[],
  open: boolean;
  onTaskUpdate: (task: Task) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [editingField, setEditingField] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col justify-start w-[90%] max-w-[1100px] h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          You can update your task’s details here.
        </DialogDescription>
        <div className="no-scrollbar -mx-4 max-h-[75vh] overflow-y-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:order-last flex flex-col gap-6">
              <InlineStatus
                task={task}
                onTaskUpdate={onTaskUpdate}
              />
              <Collapsible defaultOpen className="rounded-md border">
                <CollapsibleTrigger asChild>
                  <Button tabIndex={-1}
                    variant="ghost" size="lg"
                    className="flex justify-start group w-full px-4 text-md">
                    <ChevronRightIcon className="group-data-[state=open]:rotate-90" />
                    Details
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-5 data-[state=open]:px-3 data-[state=open]:py-2.5 pt-0 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="min-w-[70px] text-sm font-medium">Assignee</div>
                    <InlineAssignee
                      task={task}
                      members={members}
                      onTaskUpdate={onTaskUpdate}
                    />  
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="min-w-[70px] text-sm font-medium">Priority</div>
                    <InlinePriority
                      task={task}
                      onTaskUpdate={onTaskUpdate}
                    />  
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            <div className="col-span-2 flex flex-col gap-6">
              <InlineTitle
                task={task}
                onTaskUpdate={onTaskUpdate}
                isEditing={editingField === "title"}
                onEditingChange={(val) => setEditingField(val ? "title" : null)}
              />
              <InlineDescription
                task={task}
                onTaskUpdate={onTaskUpdate}
                isEditing={editingField === "description"}
                onEditingChange={(val) => setEditingField(val ? "description" : null)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}