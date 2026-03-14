import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { saveFile } from "@/lib/storage";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        // 4MB limit
        if (file.size > 4 * 1024 * 1024) {
            return new NextResponse("File size exceeds 4MB limit", { status: 400 });
        }

        const result = await saveFile(file);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[UPLOAD_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
