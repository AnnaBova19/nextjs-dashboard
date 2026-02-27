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
    const data = await sql<{ status: string; tasks: Task[] }[]>`
      SELECT 
        tasks.status,
        json_agg(
          to_json(tasks)::jsonb || (
            CASE 
              WHEN tasks.assignee_id IS NULL THEN '{}'::jsonb
              ELSE json_build_object(
                'assignee', json_build_object(
                  'id', members.id,
                  'first_name', members.first_name,
                  'last_name', members.last_name,
                  'image_url', members.image_url
                )
              )::jsonb
            END
          ) ORDER BY tasks.position
        ) AS tasks
      FROM tasks
      LEFT JOIN members ON tasks.assignee_id = members.id
      WHERE tasks.project_id = ${id}
      GROUP BY tasks.status
      ORDER BY 
        CASE tasks.status
          WHEN 'todo' THEN 1
          WHEN 'in-progress' THEN 2
          WHEN 'done' THEN 3
        END;
    `;

    const defaultStatuses = { todo: [], 'in-progress': [], done: [] };
    return data.reduce((acc, { status, tasks }) => {
      acc[status] = tasks;
      return acc;
    }, { ...defaultStatuses } as Record<string, Task[]>);
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
    return { success: false, message: 'Database Error: Failed to Create Invoice.' };
  }

  revalidatePath(`/dashboard/projects/${project_id}`);
  return { success: true, message: 'Task created successfully!' };
}