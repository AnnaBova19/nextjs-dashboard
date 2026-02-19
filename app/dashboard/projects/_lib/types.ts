import { ProjectStatus } from "./enums";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  created_at: number;
  archived_at?: number;
};