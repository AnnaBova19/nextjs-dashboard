import { z } from "zod";

export const MAX_FILE_SIZE = 1000000; // 1MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const CreateMemberFormSchema = z.object({
  id: z.string(),
  imageFile: z
    .any()
    .refine((file) => file && file instanceof File && file.size > 0, "Image is required") // Check if a file is present and not empty
    .refine((file) => file && file instanceof File && file.size <= MAX_FILE_SIZE, "Max image size is 1MB")
    .refine(
      (file) => file && file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported"
    ),
  firstName: z.string().min(1, { message: "First name is required" }).trim(),
  lastName: z.string().min(1, { message: "Last name is required" }).trim(),
  email: z.string().email(),
});
export const CreateMemberSchema = CreateMemberFormSchema.omit({ id: true });

export const UpdateMemberFormSchema = z.object({
  id: z.string(),
  imageFile: z.any().optional(),
  firstName: z.string().min(1, { message: "First name is required" }).trim(),
  lastName: z.string().min(1, { message: "Last name is required" }).trim(),
  email: z.string().email(),
  oldImageUrl: z.string().optional(), // Add oldImageUrl to the schema
  isOldImageRemoved: z.boolean(),
});
export const UpdateMemberSchema = UpdateMemberFormSchema.omit({ id: true })
  .superRefine((data, ctx) => {
    if (data.isOldImageRemoved && (!data.imageFile || !(data.imageFile instanceof File) || data.imageFile.size === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['imageFile'],
        message: "Image is required",
      });
      return;
    }

    if (data.imageFile instanceof File && data.imageFile.size > 0) {
      if (data.imageFile.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['imageFile'],
          message: "Max image size is 1MB",
        });
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(data.imageFile.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['imageFile'],
          message: "Only .jpg, .jpeg, .png, and .webp formats are supported",
        });
      }
    }
  });