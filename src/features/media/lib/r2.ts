// app/global/lib/r2.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { CDN_BASE_URL, cdnUrl, keyFromUrl } from "@/features/media/lib/cdn";

export const r2 = new S3Client({
  region:   "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "craftqube-media";

// Base pública del CDN (fuente única de verdad en app/global/lib/cdn.ts).
export const R2_PUBLIC_URL = CDN_BASE_URL;

// Re-export para mantener compatibilidad con imports existentes.
export { keyFromUrl };

export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket:      R2_BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }));
  return cdnUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export async function listR2Objects(prefix?: string): Promise<{ key: string; size: number }[]> {
  const res = await r2.send(new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    Prefix: prefix,
  }));
  return (res.Contents ?? []).map(o => ({ key: o.Key!, size: o.Size ?? 0 }));
}