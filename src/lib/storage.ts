import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

const isDev = process.env.NODE_ENV === "development";
const storageType = (process.env.STORAGE_TYPE || (isDev ? "LOCAL" : "S3")).toUpperCase();

const s3Configured =
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME;

// R2_ENDPOINT should be the base account URL WITHOUT the bucket:
// e.g. https://0312a93b5b948165b1c6d6c7b680b616.r2.cloudflarestorage.com
// The bucket name is appended via BUCKET_NAME separately
const s3Client = s3Configured ? new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
}) : null;

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "focus-os";
const LOCAL_PREFIX = "local:";

/**
 * Upload a file to S3/R2 (or local in dev).
 * Returns a `key` — either:
 *   - an S3 object key like `65e555a6-....png` (for R2 files)
 *   - a local path like `local:/uploads/filename.png` (for dev)
 */
export async function saveFile(file: File): Promise<{ key: string; size: number; name: string; mimeType: string }> {
    console.log(`[STORAGE] Uploading: ${file.name}, storageType=${storageType}, s3Configured=${!!s3Client}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;

    // Use S3/R2 if configured and not explicitly local
    if (s3Client && storageType === "S3") {
        try {
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
            });

            await s3Client.send(command);
            console.log(`[STORAGE] S3 Upload success key=${fileName}`);

            return {
                key: fileName,
                size: file.size,
                name: file.name,
                mimeType: file.type,
            };
        } catch (error) {
            console.error("S3 Upload failed, falling back to local if in development", error);
            if (!isDev) throw error;
        }
    }

    // Local Storage Fallback (development only)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    return {
        key: `${LOCAL_PREFIX}/uploads/${fileName}`,
        size: file.size,
        name: file.name,
        mimeType: file.type,
    };
}

/**
 * Generate a presigned URL for a given key.
 * For local keys (dev), returns the path directly.
 * For S3 keys, returns a short-lived signed URL.
 */
export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    // Local dev: return the path directly (publicly accessible in dev)
    if (key.startsWith(LOCAL_PREFIX)) {
        return key.replace(LOCAL_PREFIX, "");
    }

    // Legacy or external links: return as is
    if (key.startsWith("http://") || key.startsWith("https://")) {
        return key;
    }

    if (!s3Client) {
        throw new Error("S3 client not configured");
    }

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file by its key.
 */
export async function deleteFile(key: string) {
    // Local storage delete
    if (key.startsWith(LOCAL_PREFIX)) {
        try {
            const localPath = key.replace(LOCAL_PREFIX, "");
            const fileName = localPath.replace("/uploads/", "");
            const filePath = path.join(process.cwd(), "public", "uploads", fileName);
            await fs.unlink(filePath);
            return;
        } catch (error) {
            console.error("Failed to delete local file:", error);
        }
        return;
    }

    // Legacy: handle old-style full URLs stored before this migration
    if (key.startsWith("http")) {
        try {
            const urlObj = new URL(key);
            const parts = urlObj.pathname.split("/").filter(Boolean);
            // Last segment is usually the filename
            key = parts[parts.length - 1];
        } catch {
            console.error("Failed to parse legacy URL for deletion:", key);
            return;
        }
    }

    if (!s3Client || !key) return;

    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
        console.log(`[STORAGE] Deleted key=${key}`);
    } catch (error) {
        console.error(`Failed to delete file from R2: ${key}`, error);
    }
}
