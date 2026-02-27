import { useEffect } from "react";
import { MemberField } from "../../members/_lib/types";
import { Task } from "../_lib/types";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema } from "../_lib/schemas";
import { TaskPriority, TaskStatus } from "../_lib/enums";
import { toast } from "sonner";
import z from "zod";
import { updateTask } from "@/app/lib/actions/task-actions";

export default function EditProjectModal({
  projectId,
  task,
  members,
  open,
  onOpenChange,
}: {
  projectId: string;
  task: Task;
  members: MemberField[],
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
      assignee_id: "",
    },
  });

  async function onSubmit(data: z.infer<typeof TaskSchema>) {
    const result = await updateTask(data);
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
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Update your task’s details here.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}