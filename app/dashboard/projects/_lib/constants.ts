import { Bars2Icon, ChevronDoubleDownIcon, ChevronDoubleUpIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { TaskPriority, TaskStatus } from "./enums";

export const TASK_STATUS_MAP = {
  [TaskStatus.TODO]: { label: 'To Do', variant: 'outline' },
  [TaskStatus.IN_PROGRESS]: { label: 'In Progress', variant: 'secondary' },
  [TaskStatus.DONE]: { label: 'Done', variant: 'default' },
} as const;

export const taskStatusOptions = Object.entries(TASK_STATUS_MAP).map(([value, config]) => ({
  value: value as TaskStatus,
  ...config,
}));

export const TASK_PRIORITY_MAP = {
  [TaskPriority.HIGHEST]: { label: 'Highest', icon: ChevronDoubleUpIcon, color: 'text-red-500' },
  [TaskPriority.HIGH]: { label: 'High', icon: ChevronUpIcon, color: 'text-red-500' },
  [TaskPriority.MEDIUM]: { label: 'Medium', icon: Bars2Icon, color: 'text-orange-500' },
  [TaskPriority.LOW]: { label: 'Low', icon: ChevronDownIcon, color: 'text-blue-500' },
  [TaskPriority.LOWEST]: { label: 'Lowest', icon: ChevronDoubleDownIcon, color: 'text-blue-500' },
} as const;

export const taskPriorityOptions = Object.entries(TASK_PRIORITY_MAP).map(([value, config]) => ({
  value: value as TaskPriority,
  ...config,
}));