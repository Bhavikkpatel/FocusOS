import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

const s3Client = new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export async function saveFile(file: File): Promise<{ url: string; size: number; name: string; mimeType: string }> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
    });

    await s3Client.send(command);

    // If R2_PUBLIC_URL is provided, use that to construct a direct public URL
    // Otherwise, you can use presigned URLs or a custom worker route if R2 is not public
    const url = process.env.R2_PUBLIC_URL 
        ? `${process.env.R2_PUBLIC_URL}/${fileName}`
        : `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/uploads/${fileName}`; // fallback to proxy if needed

    return {
        url,
        size: file.size,
        name: file.name,
        mimeType: file.type,
    };
}

export async function deleteFile(url: string) {
    let fileName = "";
    
    // Extract filename from URL depending on format
    if (process.env.R2_PUBLIC_URL && url.startsWith(process.env.R2_PUBLIC_URL)) {
        fileName = url.replace(`${process.env.R2_PUBLIC_URL}/`, "");
    } else if (url.startsWith("/api/uploads/") || (process.env.NEXT_PUBLIC_APP_URL && url.startsWith(`${process.env.NEXT_PUBLIC_APP_URL}/api/uploads/`))) {
        const urlObj = new URL(url, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
        fileName = urlObj.pathname.split('/').pop() || "";
    } else {
        // Fallback or old format
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
