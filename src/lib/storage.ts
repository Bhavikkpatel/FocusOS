import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

const isDev = process.env.NODE_ENV === "development";
const storageType = process.env.STORAGE_TYPE || (isDev ? "LOCAL" : "S3");

const s3Configured = 
    process.env.R2_ENDPOINT && 
    process.env.R2_ACCESS_KEY_ID && 
    process.env.R2_SECRET_ACCESS_KEY && 
    process.env.R2_BUCKET_NAME;

const s3Client = s3Configured ? new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
}) : null;

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export async function saveFile(file: File): Promise<{ url: string; size: number; name: string; mimeType: string }> {
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

            const url = process.env.R2_PUBLIC_URL 
                ? `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${BUCKET_NAME}/${fileName}`
                : `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/uploads/${fileName}`;

            return {
                url,
                size: file.size,
                name: file.name,
                mimeType: file.type,
            };
        } catch (error) {
            console.error("S3 Upload failed, falling back to local if in development", error);
            if (!isDev) throw error;
        }
    }

    // Local Storage Fallback
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Standard Next.js public access is via /uploads/ filename
    const url = `/uploads/${fileName}`;

    return {
        url,
        size: file.size,
        name: file.name,
        mimeType: file.type,
    };
}

export async function deleteFile(url: string) {
    // Local storage delete
    if (url.startsWith("/uploads/")) {
        try {
            const fileName = url.replace("/uploads/", "");
            const filePath = path.join(process.cwd(), "public", "uploads", fileName);
            await fs.unlink(filePath);
            return;
        } catch (error) {
            console.error("Failed to delete local file:", error);
        }
    }

    if (!s3Client) return;

    let fileName = "";
    
    // Extract filename from URL depending on format
    if (process.env.R2_PUBLIC_URL && url.startsWith(process.env.R2_PUBLIC_URL)) {
        fileName = url.replace(`${process.env.R2_PUBLIC_URL}/`, "");
    } else if (url.startsWith("/api/uploads/") || (process.env.NEXT_PUBLIC_APP_URL && url.startsWith(`${process.env.NEXT_PUBLIC_APP_URL}/api/uploads/`))) {
        const urlObj = new URL(url, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
        fileName = urlObj.pathname.split('/').pop() || "";
    } else {
        return;
    }

    if (!fileName) return;

    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
        });
        await s3Client.send(command);
    } catch (error) {
        console.error(`Failed to delete file from R2: ${fileName}`, error);
    }
}
