'use server';

import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';
import { z } from 'zod';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }).trim(),
  email: z.string().email(),
  password: z.string().min(8),
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function signUp(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = FormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input. Please enter valid name, email, and password.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userExists.rowCount && userExists.rowCount > 0) {
      return { message: "This email is already registered." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );
  } catch (error) {
    return { error: 'The user already exists or an error occurred.' };
  }

  // automatically log in the user after successful registration
  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' }); 
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: 'Error logging in after registration.' };
    }
    throw error;
  }
  return { message: 'Signup successful.'};
}
