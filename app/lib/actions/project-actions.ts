'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { Project } from "@/app/dashboard/projects/_lib/types";
import { ProjectStatus } from '@/app/dashboard/projects/_lib/enums';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const PROJECTS_ITEMS_PER_PAGE = 6;
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
      ORDER BY projects.created_at DESC
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

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  try {
    await sql`
      UPDATE projects
      SET
        status = ${status},
        archived_at = ${status === ProjectStatus.ARCHIVED ? new Date() : null}
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/projects');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete project.');
  }
}

export type State = {
  success: boolean;
  errors?: {
    name?: string[];
    description?: string[];
  };
  message?: string | null;
};

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }).trim(),
  description: z.string().min(1, { message: "Description is required" }).trim(),
  created_at: z.string(),
});

const CreateProject = FormSchema.omit({ id: true, created_at: true });
export async function createProject(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateProject.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Project.',
    };
  }

  const { name, description } = validatedFields.data;
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
  return { success: true, errors: {}, message: 'Project created successfully!' };
}

const UpdateProject = FormSchema.omit({ id: true, created_at: true });
export async function updateProject(id: string, prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = UpdateProject.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  console.log(222, validatedFields)
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Project.',
    };
  }

  const { name, description } = validatedFields.data;

  try {
    await sql`
      UPDATE projects
      SET name = ${name}, description = ${description}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Update Project.' };
  }

  revalidatePath('/dashboard/projects');
  return { success: true, errors: {}, message: 'Project updated successfully!' };
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