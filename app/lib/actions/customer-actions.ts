'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { deleteImageFromS3, uploadImageToS3 } from './s3-actions';
import { CustomerForm } from '@/app/dashboard/customers/_lib/types';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export type State = {
  success: boolean;
  errors?: {
    imageFile?: string[];
    firstName?: string[];
    lastName?: string[];
    email?: string[];
  };
  message?: string | null;
};

const MAX_FILE_SIZE = 1000000; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const CreateCustomerFormSchema = z.object({
  id: z.string(),
  imageFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Image is required.") // Check if a file is present and not empty
    .refine((file) => file.size <= MAX_FILE_SIZE, "Max image size is 1MB.")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported."
    ),
  firstName: z.string().min(1, { message: "First name is required" }).trim(),
  lastName: z.string().min(1, { message: "Last name is required" }).trim(),
  email: z.string().email(),
});

const CreateCustomer = CreateCustomerFormSchema.omit({ id: true });
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
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { firstName, lastName, email } = validatedFields.data;
  let imageUrl: string | null;

  // Upload image to S3 and get the URL
  try {
    const file = validatedFields.data.imageFile as File;
    const uploadResult = await uploadImageToS3(file);
    imageUrl = uploadResult.url || null;
    if (!uploadResult.success || !imageUrl) {
      return { success: false, message: uploadResult.error || 'Failed to upload image. Please try again.' };
    }
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return { success: false, message: 'Failed to upload image. Please try again.' };
  }

  // upload data to database
  try {
    await sql`
      INSERT INTO customers (first_name, last_name, email, image_url)
      VALUES (${firstName}, ${lastName}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Create Customer.' };
  }

  revalidatePath('/dashboard/customers');
  return { success: true, errors: {}, message: 'Customer created successfully!' };
}

const UpdateCustomerFormSchema = z.object({
  id: z.string(),
  imageFile: z.instanceof(File).optional(),
  firstName: z.string().min(1, { message: "First name is required" }).trim(),
  lastName: z.string().min(1, { message: "Last name is required" }).trim(),
  email: z.string().email(),
  oldImageUrl: z.string().optional(), // Add oldImageUrl to the schema
  isOldImageRemoved: z.boolean(),
});
const UpdateCustomer = UpdateCustomerFormSchema.omit({ id: true })
  .superRefine((data, ctx) => {
    if (data.isOldImageRemoved && !(data.imageFile instanceof File && data.imageFile.size > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageFile'],
        message: "Image is required.",
      });
    }
  })
  .superRefine((data, ctx) => {
    if (data.isOldImageRemoved && data.imageFile instanceof File && data.imageFile.size > MAX_FILE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageFile'],
        message: "Max image size is 1MB.",
      });
    }
  })
  .superRefine((data, ctx) => {
    if (data.isOldImageRemoved &&data.imageFile instanceof File && !ACCEPTED_IMAGE_TYPES.includes(data.imageFile.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageFile'],
        message: "Only .jpg, .jpeg, .png, and .webp formats are supported.",
      });
    }
  });

export async function updateCustomer(id: string, isOldImageRemoved: boolean, prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = UpdateCustomer.safeParse({
    imageFile: formData.get('imageFile'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    isOldImageRemoved,
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { imageFile, firstName, lastName, email } = validatedFields.data;
  const oldImageUrl = formData.get('oldImageUrl') as string | null;
  let imageUrl = oldImageUrl || null;

  // upload new image to S3 and get the new URL
  const hasNewImage = imageFile instanceof File && imageFile.size > 0;
  if (hasNewImage) {
    try {
      const uploadResult = await uploadImageToS3(imageFile);
      imageUrl = uploadResult.url || null;
      if (!uploadResult.success || !imageUrl) {
        return { success: false, message: uploadResult.error || 'Failed to upload new image. Please try again.' };
      }
      // remove old image from S3 after successful new upload
      if (isOldImageRemoved && oldImageUrl) {
        const oldImageKey = oldImageUrl?.split('/').pop() || '';
        if (oldImageKey) {
          try {
            await deleteImageFromS3(oldImageKey);
          } catch (err) {
            console.error("Failed to delete old image:", err);
            return {
              success: false,
              message: "Failed to delete old image. Please try again.",
            };
          }
        }
      }
    } catch (err) {
      console.error("Failed to upload new image:", err);
      return {
        success: false,
        message: "Failed to upload new image. Please try again.",
      };
    }
  }

  // upload data to database
  try {
    await sql`
      UPDATE customers
      SET first_name = ${firstName}, last_name = ${lastName}, email = ${email}, image_url = ${imageUrl}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Update Customer.' };
  }

  revalidatePath('/dashboard/customers');
  return { success: true, errors: {}, message: 'Customer updated successfully!' };
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