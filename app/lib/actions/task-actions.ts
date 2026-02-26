'use server';

import { TaskSchema } from '@/app/dashboard/projects/_lib/schemas';
import { Task } from '@/app/dashboard/projects/_lib/types';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { z } from 'zod';
import { dateToDbTimestamp } from '../utils';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchProjectTasksById(id: string) {
  try {
    const data = await sql<Task[]>`
      SELECT 
        tasks.*,
      CASE 
        WHEN tasks.assignee_id IS NULL THEN '{}'::json
        ELSE json_build_object(
          'id', members.id,
          'first_name', members.first_name,
          'last_name', members.last_name,
          'image_url', members.image_url
        )
      END AS assignee
      FROM tasks
      LEFT JOIN members ON tasks.assignee_id = members.id
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

  const { title, description, status, priority, due_date, project_id, assignee_id } = validated.data;
  const dateTimestamp = dateToDbTimestamp(due_date);

  try {
    await sql`
      INSERT INTO tasks (title, description, status, priority, due_date, project_id, assignee_id)
      VALUES (${title}, ${description}, ${status}, ${priority}, ${dateTimestamp}, ${project_id}, ${assignee_id ?? null})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Create Invoice.' };
  }

  revalidatePath(`/dashboard/projects/${project_id}`);
  return { success: true, message: 'Task created successfully!' };
}