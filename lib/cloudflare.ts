import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Get environment variables from Convex
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const CLOUDFLARE_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const CLOUDFLARE_BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME;


if (!CLOUDFLARE_ACCESS_KEY_ID) {
  throw new Error("NEXT_PUBLIC_CLOUDFLARE_ACCESS_KEY_ID is not set");
}

if (!CLOUDFLARE_ACCOUNT_ID) {
  throw new Error("NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID is not set");
}

if (!CLOUDFLARE_SECRET_ACCESS_KEY) {
  throw new Error("NEXT_PUBLIC_CLOUDFLARE_SECRET_ACCESS_KEY is not set");
}

if (!CLOUDFLARE_BUCKET_NAME) {
  throw new Error("NEXT_PUBLIC_CLOUDFLARE_BUCKET_NAME is not set");
}

export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for Cloudflare R2
});

export async function getUploadUrl(fileName: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: CLOUDFLARE_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
    ACL: "public-read", // Make the file publicly readable
  });

  const signedUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600,
    signableHeaders: new Set([
      "host",
      "x-amz-date",
      "x-amz-content-sha256",
      "content-type",
    ]),
  });

  const publicUrl = `https://${CLOUDFLARE_BUCKET_NAME}.r2.dev/${fileName}`;

  return {
    signedUrl,
    publicUrl,
  };
} 