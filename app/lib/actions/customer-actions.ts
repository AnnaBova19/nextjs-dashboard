'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { deleteImageFromS3, uploadImageToS3 } from './s3-actions';
import { CustomerForm } from '@/app/dashboard/customers/_lib/types';
import { CreateCustomerSchema, UpdateCustomerSchema } from '@/app/dashboard/customers/_lib/schemas';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createCustomer(formData: FormData) {
  const validated = CreateCustomerSchema.safeParse({
    imageFile: formData.get('imageFile'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
  });
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    };
  }

  const { imageFile, firstName, lastName, email } = validated.data;
  let imageUrl: string | null = null;

  // Upload image to S3 and get the URL
  try {
    if (imageFile instanceof File && imageFile.size > 0) {
      const uploadResult = await uploadImageToS3(imageFile);
      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, message: uploadResult.error || 'Failed to upload image. Please try again.' };
      }
      imageUrl = uploadResult.url || null;
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
  return { success: true, message: 'Customer created successfully!' };
}

export async function updateCustomer(id: string, formData: FormData) {
  const isRemoved = formData.get('isOldImageRemoved') === 'true';
  const validated = UpdateCustomerSchema.safeParse({
    imageFile: formData.get('imageFile'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    oldImageUrl: formData.get('oldImageUrl'),
    isOldImageRemoved: isRemoved,
  });
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Customer.',
    };
  }

  const { imageFile, firstName, lastName, email, oldImageUrl, isOldImageRemoved } = validated.data;
  let imageUrl = oldImageUrl || null;

  // upload new image to S3 and get the new URL
  const hasNewImage = imageFile instanceof File && imageFile.size > 0;
  if (hasNewImage) {
    try {
      const uploadResult = await uploadImageToS3(imageFile);
      if (!uploadResult.success || !uploadResult.url) {
        return { success: false, message: uploadResult.error || 'Failed to upload new image. Please try again.' };
      }
      imageUrl = uploadResult.url;
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