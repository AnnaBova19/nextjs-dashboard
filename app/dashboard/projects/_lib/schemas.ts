import { z } from "zod";

export const ProjectFormSchema = z.object({
  id: z.string(),
  name: z.string().min(5, { message: "Title must be at least 5 characters" }).trim(),
  description: z.string()
    .min(20, { message: "Description must be at least 20 characters" }).trim()
    .max(255, { message: "Description cannot exceed 255 characters" }).trim(),
  created_at: z.string(),
});
export const ProjectSchema = ProjectFormSchema.omit({ id: true, created_at: true });

export const TaskFormSchema = z.object({
  id: z.string(),
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).trim(),
  description: z.string()
    .min(20, { message: "Description must be at least 20 characters" }).trim()
    .max(255, { message: "Description cannot exceed 255 characters" }).trim(),
  created_at: z.string(),
});
export const TaskSchema = TaskFormSchema.omit({ id: true, created_at: true });
