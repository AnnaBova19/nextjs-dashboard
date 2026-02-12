'use server';

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

export async function uploadImageToS3(file: File) {
  if (!file) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${Date.now()}-${file.name}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return { success: true, url: imageUrl };
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    return { error: "Failed to upload image to S3" };
  }
}

export async function deleteImageFromS3(imageKey: string) {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: imageKey,
    };

    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`Successfully deleted image with key: ${imageKey}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    return { success: false, error: "Failed to delete image." };
  }
}