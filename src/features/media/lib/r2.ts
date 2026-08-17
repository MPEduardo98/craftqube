// app/global/lib/r2.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
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
  const out: { key: string; size: number }[] = [];
  let token: string | undefined;

  // ListObjectsV2 pagina de 1000 en 1000: hay que seguir el token o la
  // biblioteca se queda corta en buckets grandes.
  do {
    const res = await r2.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix, ContinuationToken: token })
    );
    for (const o of res.Contents ?? []) out.push({ key: o.Key!, size: o.Size ?? 0 });
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  return out;
}

/**
 * Lista un "nivel" del bucket como un explorador de archivos: usa Delimiter
 * para que R2 agrupe todo lo que cuelga de una carpeta en un CommonPrefix
 * en vez de devolver el árbol entero aplanado.
 */
export async function listR2Level(prefix = ""): Promise<{
  folders: string[];
  files:   { key: string; size: number; lastModified?: Date }[];
}> {
  const folders: string[] = [];
  const files:   { key: string; size: number; lastModified?: Date }[] = [];
  let token: string | undefined;

  do {
    const res = await r2.send(
      new ListObjectsV2Command({
        Bucket:            R2_BUCKET,
        Prefix:            prefix,
        Delimiter:         "/",
        ContinuationToken: token,
      })
    );

    for (const p of res.CommonPrefixes ?? []) {
      if (p.Prefix) folders.push(p.Prefix);
    }
    for (const o of res.Contents ?? []) {
      // El marcador de carpeta vacía ("algo/") no es un archivo real.
      if (!o.Key || o.Key.endsWith("/")) continue;
      files.push({ key: o.Key, size: o.Size ?? 0, lastModified: o.LastModified });
    }

    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  return { folders, files };
}

/** true si el objeto existe en el bucket. */
export async function r2ObjectExists(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Mueve (renombra) un objeto: R2/S3 no tiene "rename", así que se copia al
 * destino y se borra el origen. Devuelve la nueva URL pública.
 */
export async function moveR2Object(fromKey: string, toKey: string): Promise<string> {
  await r2.send(new CopyObjectCommand({
    Bucket:     R2_BUCKET,
    CopySource: `${R2_BUCKET}/${fromKey}`,
    Key:        toKey,
  }));
  await deleteFromR2(fromKey);
  return cdnUrl(toKey);
}

/**
 * Crea una carpeta escribiendo el marcador vacío "prefijo/". S3/R2 no tiene
 * carpetas reales, pero este objeto hace que aparezca aunque esté vacía.
 */
export async function createR2Folder(prefix: string): Promise<void> {
  const key = prefix.endsWith("/") ? prefix : `${prefix}/`;
  await r2.send(new PutObjectCommand({
    Bucket:        R2_BUCKET,
    Key:           key,
    Body:          Buffer.alloc(0),
    ContentType:   "application/x-directory",
  }));
}