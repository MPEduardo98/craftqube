// app/global/lib/r2.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region:   "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET     = process.env.R2_BUCKET_NAME ?? "craftqube-media";
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket:      R2_BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }));
  return `${R2_PUBLIC_URL}/${key}`;
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

/** Extrae el key de R2 desde una URL pública */
export function keyFromUrl(url: string): string {
  return url.replace(`${R2_PUBLIC_URL}/`, "");
}