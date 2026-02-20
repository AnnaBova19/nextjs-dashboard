import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(5, { message: "Title must be at least 5 characters." }).trim(),
  description: z.string()
    .min(20, { message: "Description must be at least 20 characters." }).trim()
    .max(255, { message: "Description cannot exceed 255 characters." }).trim(),
  created_at: z.string(),
});

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).trim(),
  description: z.string()
    .min(20, { message: "Description must be at least 20 characters." }).trim()
    .max(255, { message: "Description cannot exceed 255 characters." }).trim(),
  created_at: z.string(),
});
