import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function ensureUploadDir() {
    try {
        await fs.access(UPLOAD_DIR);
    } catch {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
}

export async function saveFile(file: File): Promise<{ url: string; size: number; name: string; mimeType: string }> {
    await ensureUploadDir();

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    // In a real cloud storage, this would be the public URL
    // Here we use the local path relative to public
    const url = `/uploads/${fileName}`;

    return {
        url,
        size: file.size,
        name: file.name,
        mimeType: file.type,
    };
}

export async function deleteFile(url: string) {
    if (!url.startsWith("/uploads/")) return;

    const fileName = url.replace("/uploads/", "");
    const filePath = path.join(UPLOAD_DIR, fileName);

    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error(`Failed to delete file: ${filePath}`, error);
    }
}
