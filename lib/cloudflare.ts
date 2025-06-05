import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Hardcoded values (temporary fix)
const CLOUDFLARE_ACCOUNT_ID = "64b15641bed7082960be1467d7ea0264";
const CLOUDFLARE_ACCESS_KEY_ID = "70ab5630db9d967d8efd6a0562f3d1fe";
const CLOUDFLARE_SECRET_ACCESS_KEY = "8d8409c984b640d89c8f0f24eb0351fe154e606d98f359c531b853507355150d";
const CLOUDFLARE_BUCKET_NAME = "silocsm";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export async function getUploadUrl(fileName: string, contentType: string) {
  try {
    console.log("🚀 [Convex] Generating upload URL for:", fileName);
    console.log("📝 [Convex] Content Type:", contentType);
    console.log("🪣 [Convex] Bucket:", CLOUDFLARE_BUCKET_NAME);
    
    const command = new PutObjectCommand({
      Bucket: CLOUDFLARE_BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    console.log("⚙️ [Convex] S3 Command created successfully");

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600,
    });

    console.log("✅ [Convex] Signed URL generated successfully");
    console.log("🔗 [Convex] URL preview:", signedUrl.substring(0, 100) + "...");

    const publicUrl = `https://${CLOUDFLARE_BUCKET_NAME}.r2.dev/${fileName}`;
    console.log("🌐 [Convex] Public URL:", publicUrl);

    return {
      signedUrl,
      publicUrl,
    };
  } catch (error) {
    console.error("❌ [Convex] Error generating upload URL:", error);
    throw new Error(`Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 