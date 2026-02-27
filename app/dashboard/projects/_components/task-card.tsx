"use client";

import { ExclamationCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import { TASK_PRIORITY_MAP } from "../_lib/constants";
import { TaskPriority } from "../_lib/enums";
import { Task } from "../_lib/types";
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { TaskAction } from "./buttons";

export function TaskCard({
  task,
  showActions = true,
  onEdit,
  onDeleteConfirm,
}: {
  task: Task;
  showActions?: boolean;
  onEdit: (task: Task) => void;
  onDeleteConfirm: (task: Task) => void;
}) {
  const selectedPriority = TASK_PRIORITY_MAP[task.priority as TaskPriority];
  const SelectedPriorityIcon = selectedPriority?.icon;

  return (
    <div className="flex flex-col gap-4 bg-white rounded-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg">
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold">
          {task.title}
        </div>
        {showActions && (
          <TaskAction
            task={task}
            onEdit={() => onEdit(task)}
            onDeleteConfirm={() => onDeleteConfirm(task)} />
        )}
      </div>

      <div className="text-sm text-gray-700 line-clamp-2">
        {task.description}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        {/* <ExclamationCircleIcon className="w-4 text-red-500" /> */}
        Due Date: {format(new Date(task.due_date), "MMM d, yyyy")}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {SelectedPriorityIcon && (
            <SelectedPriorityIcon className={`h-4 w-4 ${selectedPriority.color}`} />
          )}
          <span className="text-sm">{selectedPriority.label}</span>
        </div>
        {task.assignee_id && task.assignee ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src={task.assignee?.image_url}
                  alt={`${task.assignee?.first_name} ${task.assignee?.last_name}'s profile picture`}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                  style={{ width: '28px', height: '28px', 'minWidth': '28px' }}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-700/75">
                <p>Assignee: {`${task.assignee?.first_name} ${task.assignee?.last_name}`}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex justify-center items-center w-[28px] h-[28px] rounded-full bg-blue-100/50">
            <UserIcon className="w-4 text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
}