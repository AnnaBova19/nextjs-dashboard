'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { Project } from "@/app/dashboard/projects/_lib/types";
import { ProjectStatus } from '@/app/dashboard/projects/_lib/enums';
import { ProjectSchema } from '@/app/dashboard/projects/_lib/schemas';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const PROJECTS_ITEMS_PER_PAGE = 10;
export async function fetchFilteredProjects(query: string, currentPage: number, status: ProjectStatus) {
  const offset = (currentPage - 1) * PROJECTS_ITEMS_PER_PAGE;

  try {
    const projects = await sql<Project[]>`
      SELECT * FROM projects
      WHERE
        projects.status = ${status}
        ${
          query
            ? sql`AND (
                projects.name ILIKE ${`%${query}%`} OR
                projects.description ILIKE ${`%${query}%`}
              )`
            : sql``
        }
      ORDER BY projects.updated_at DESC
      LIMIT ${PROJECTS_ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return projects;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch projects.');
  }
}

export async function fetchProjectsPages(query: string, status: ProjectStatus) {
  try {
    const data = await sql`SELECT COUNT(*)
      FROM projects
      WHERE
        status = ${status} AND
        (name ILIKE ${`%${query}%`} OR description ILIKE ${`%${query}%`})
    `;

    const totalPages = Math.ceil(Number(data[0].count) / PROJECTS_ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of projects.');
  }
}

export async function fetchProjectById(id: string) {
  try {
    const data = await sql<Project[]>`
      SELECT
        projects.id,
        projects.name,
        projects.description,
        projects.status
      FROM projects
      WHERE projects.id = ${id};
    `;

    return data[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch project.');
  }
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  try {
    await sql`
      UPDATE projects
      SET
        status = ${status},
        archived_at = ${status === ProjectStatus.ARCHIVED ? new Date().toISOString() : null}
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/projects');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete project.');
  }
}

const CreateProject = ProjectSchema.omit({ id: true, created_at: true });
export async function createProject(data: z.infer<typeof CreateProject>) {
  const validated = CreateProject.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Project.',
    };
  }

  const { name, description } = validated.data;
  const status = ProjectStatus.ACTIVE;

  try {
    await sql`
      INSERT INTO projects (name, description, status)
      VALUES (${name}, ${description}, ${status})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Create Project.' };
  }

  revalidatePath('/dashboard/projects');
  return { success: true, message: 'Project created successfully!' };
}

const UpdateProject = ProjectSchema.omit({ id: true, created_at: true });
export async function updateProject(id: string, data: z.infer<typeof UpdateProject>) {
  const validated = UpdateProject.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Project.',
    };
  }

  const { name, description } = validated.data;

  try {
    await sql`
      UPDATE projects
      SET name = ${name}, description = ${description}, updated_at = NOW()
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Update Project.' };
  }

  revalidatePath('/dashboard/projects');
  return { success: true, message: 'Project updated successfully!' };
}

export async function deleteProject(id: string) {
  try {
    await sql`DELETE FROM projects WHERE id = ${id}`;
    revalidatePath('/dashboard/projects');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete project.');
  }
}