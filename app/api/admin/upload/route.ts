import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds maximum 10MB limit" },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed: PNG, JPG, JPEG, WEBP, GIF" },
        { status: 400 }
      );
    }

    // Determine safe extension
    let originalName = "";
    if (typeof (file as any).name === "string") {
      originalName = path.basename((file as any).name);
    }
    const ext = (path.extname(originalName) || ".png").toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Invalid file extension. Allowed: .png, .jpg, .jpeg, .webp, .gif" },
        { status: 400 }
      );
    }

    // Generate unique unguessable filename
    const uniqueId = crypto.randomBytes(12).toString("hex");
    const sanitizedFileName = `rvx_${Date.now()}_${uniqueId}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic Bytes Verification (defense-in-depth against malicious file extension spoofing)
    const isPng = buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isJpg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isGif = buffer.length > 3 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
    const isWebp = buffer.length > 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    if (!isPng && !isJpg && !isGif && !isWebp) {
      return NextResponse.json(
        { error: "Corrupted or invalid image binary signature (magic bytes rejected)" },
        { status: 400 }
      );
    }

    const filePath = path.join(uploadsDir, sanitizedFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${sanitizedFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: sanitizedFileName,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Admin file upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
