import { useEffect, useState, useTransition } from "react";
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
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { RichEditor } from "@/app/ui/shared/rich-text-editor";

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
      <div
        className="cursor-pointer hover:bg-muted rounded px-2 py-2 min-h-[60px] rich-text"
        dangerouslySetInnerHTML={{ 
          __html: task.description || "<p class='text-muted-foreground text-sm'>Add a description...</p>" 
        }}
        onClick={() => onEditingChange(true)}>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
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
      <DialogContent className="w-[90%] max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          You can update your task’s details here.
        </DialogDescription>
        <div className="flex flex-col gap-3 no-scrollbar -mx-4 max-h-[75vh] overflow-y-auto px-4">
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
      </DialogContent>
    </Dialog>
  );
}