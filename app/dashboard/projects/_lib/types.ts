import { ProjectStatus, TaskPriority, TaskStatus } from "./enums";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  created_at: number;
  updated_at: number;
  archived_at?: number;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: number;
  created_at: number;
  archived_at?: number;
};