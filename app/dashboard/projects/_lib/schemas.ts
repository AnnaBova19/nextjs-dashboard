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

const today = new Date();
today.setHours(0, 0, 0, 0); 

export const TaskFormSchema = z.object({
  id: z.string(),
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).trim(),
  description: z.string()
    .min(20, { message: "Description must be at least 20 characters" }).trim(),
  status: z.enum(['todo', 'in-progress', 'done'], {
    required_error: 'Please select a task status',
  }),
  assignee_id: z.string().optional().nullable().or(z.literal(''))
    .transform((val) => (val === '' || val === undefined ? null : val))
    .refine((val) => val === null || z.string().uuid().safeParse(val).success, {
      message: "Invalid UUID format",
    }),
  priority: z.enum(['lowest', 'low', 'medium', 'high', 'highest'], {
    required_error: 'Please select a task priority',
  }),
  due_date: z.coerce.date({
    required_error: "Date is required",
  }).min(today, { message: "Date must be in the future" }),
  created_at: z.string(),
  project_id: z.string(),
});
export const TaskSchema = TaskFormSchema.omit({ id: true, created_at: true });
