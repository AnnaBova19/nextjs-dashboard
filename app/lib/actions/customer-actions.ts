'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { deleteImageFromS3, uploadImageToS3 } from './s3-actions';
import { CustomerForm } from '../definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export type State = {
  errors?: {
    imageFile?: string[];
    firstName?: string[];
    lastName?: string[];
    email?: string[];
  };
  message?: string | null;
};

const MAX_FILE_SIZE = 4000000; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const FormSchema = z.object({
  id: z.string(),
  imageFile: z
    .any()
    .refine((file) => file instanceof File && file.size > 0, "Image is required.") // Check if a file is present and not empty
    .refine((file) => file instanceof File && file.size <= MAX_FILE_SIZE, "Max image size is 4MB.")
    .refine(
      (file) => file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported."
    ),
  firstName: z.string().min(1, { message: "First name is required" }).trim(),
  lastName: z.string().min(1, { message: "Last name is required" }).trim(),
  email: z.string().email(),
});

const CreateCustomer = FormSchema.omit({ id: true });

export async function createCustomer(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateCustomer.safeParse({
    imageFile: formData.get('imageFile'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  // Upload image to S3 and get the URL
  const file = validatedFields.data.imageFile as File;
  let uploadResult: { success?: boolean; url?: string; error?: string };
  let imageUrl: string | undefined;
  try {
    uploadResult = await uploadImageToS3(file);
    imageUrl = uploadResult.url;
    if (!uploadResult.success || !imageUrl) {
      return { message: uploadResult.error || 'Failed to upload image. Please try again.' };
    }
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return { message: 'Failed to upload image. Please try again.' };
  }

  // Prepare data for insertion into the database
  const { firstName, lastName, email } = validatedFields.data;
  const name = `${firstName} ${lastName}`;

  try {
    await sql`
      INSERT INTO customers (name, email, image_url)
      VALUES (${name}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    // throw new Error('Failed to create customer.');
    return { message: 'Database Error: Failed to Create Customer.' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

export async function deleteCustomer(customer: CustomerForm) {
  try {
    await sql`DELETE FROM customers WHERE id = ${customer.id}`;
    // If the customer has an associated image, delete it from S3
    if (customer?.image_url) {
      try {
        const imageKey = customer.image_url.split('/').pop(); // Extract the file name from the URL
        await deleteImageFromS3(imageKey || '');
      } catch (error) {
        console.error('S3 Deletion Error:', error);
        throw new Error('Failed to delete customer image from S3.');
      }
    }

    revalidatePath('/dashboard/customers');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete customer.');
  }
}