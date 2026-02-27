'use server';

import { TaskSchema } from '@/app/dashboard/projects/_lib/schemas';
import { Task } from '@/app/dashboard/projects/_lib/types';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { z } from 'zod';
import { dateToDbTimestamp } from '../utils';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchProjectTasksByIdGrouped(id: string) {
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
      WHERE tasks.project_id = ${id}
      ORDER BY tasks.position ASC
    `;

    const grouped = { todo: [], 'in-progress': [], done: [] };
    return data.reduce((acc, task) => {
      acc[task.status]?.push(task);
      return acc;
    }, grouped as Record<string, Task[]>);
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
      INSERT INTO tasks (title, description, status, priority, due_date, project_id, assignee_id, position)
      VALUES (
        ${title},
        ${description},
        ${status},
        ${priority},
        ${dateTimestamp},
        ${project_id},
        ${assignee_id ?? null},
        (SELECT COALESCE(MAX(position), -1) + 1 
        FROM tasks 
        WHERE project_id = ${project_id} AND status = ${status})
      )
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Create Task.' };
  }

  revalidatePath(`/dashboard/projects/${project_id}`);
  return { success: true, message: 'Task created successfully!' };
}

export async function updateTask(data: z.infer<typeof TaskSchema>) {
  const validated = TaskSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Task.',
    };
  }

  // TODO
  // revalidatePath(`/dashboard/projects/${project_id}`);
  return { success: true, message: 'Task updated successfully!' };
}

export async function deleteTask(id: string, project_id: string) {
  try {
    await sql`DELETE FROM tasks WHERE id = ${id}`;
    revalidatePath(`/dashboard/projects/${project_id}`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete task.');
  }
}