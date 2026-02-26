'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { deleteImageFromS3, uploadImageToS3 } from './s3-actions';
import { MemberForm } from '@/app/dashboard/members/_lib/types';
import { CreateMemberSchema, UpdateMemberSchema } from '@/app/dashboard/members/_lib/schemas';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createMember(formData: FormData) {
  const validated = CreateMemberSchema.safeParse({
    imageFile: formData.get('imageFile'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
  });
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Member.',
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
      INSERT INTO members (first_name, last_name, email, image_url)
      VALUES (${firstName}, ${lastName}, ${email}, ${imageUrl})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Create Member.' };
  }

  revalidatePath('/dashboard/members');
  return { success: true, message: 'Member created successfully!' };
}

export async function updateMember(id: string, formData: FormData) {
  const isRemoved = formData.get('isOldImageRemoved') === 'true';
  const validated = UpdateMemberSchema.safeParse({
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
      message: 'Missing Fields. Failed to Update Member.',
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
      UPDATE members
      SET first_name = ${firstName}, last_name = ${lastName}, email = ${email}, image_url = ${imageUrl}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Database Error: Failed to Update Member.' };
  }

  revalidatePath('/dashboard/members');
  return { success: true, errors: {}, message: 'Member updated successfully!' };
}

export async function deleteMember(member: MemberForm) {
  try {
    await sql`DELETE FROM members WHERE id = ${member.id}`;
    // If the member has an associated image, delete it from S3
    if (member?.image_url) {
      try {
        const imageKey = member.image_url.split('/').pop(); // Extract the file name from the URL
        await deleteImageFromS3(imageKey || '');
      } catch (error) {
        console.error('S3 Deletion Error:', error);
        throw new Error('Failed to delete member image from S3.');
      }
    }

    revalidatePath('/dashboard/members');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete member.');
  }
}