'use server';

import { TaskSchema } from '@/app/dashboard/projects/_lib/schemas';
import { Task } from '@/app/dashboard/projects/_lib/types';
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

const CreateTask = TaskSchema.omit({ id: true, created_at: true });