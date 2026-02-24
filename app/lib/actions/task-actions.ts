'use server';

import { TaskSchema } from '@/app/dashboard/projects/_lib/schemas';
import { Task } from '@/app/dashboard/projects/_lib/types';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { z } from 'zod';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchProjectTasksById(id: string) {
  try {
    const data = await sql<Task[]>`
      SELECT * FROM tasks
      WHERE tasks.project_id = ${id};
    `;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project tasks.');
  }
}

export async function createTask(data: z.infer<typeof TaskSchema>) {
  const validated = TaskSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Task.',
    };
  }

  const { title, description, status, priority, due_date, project_id } = validated.data;

  try {
    await sql`
      INSERT INTO tasks (title, description, status, priority, due_date, project_id)
      VALUES (${title}, ${description}, ${status}, ${priority}, ${due_date}, ${project_id})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Create Invoice.' };
  }

  revalidatePath(`/dashboard/projects/${project_id}`);
  return { success: true, message: 'Task created successfully!' };
}