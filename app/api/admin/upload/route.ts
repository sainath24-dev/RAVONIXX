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

    const mime = file.type || "image/png";
    const buffer = Buffer.from(await file.arrayBuffer());

    // In serverless production (e.g. Vercel), return Base64 Data URL so images are permanently embedded in JSON without 404
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.NODE_ENV === "production"
    );

    if (isServerless) {
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: sanitizedFileName,
        size: file.size,
      });
    }

    // Local development: write to public/uploads
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, sanitizedFileName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${sanitizedFileName}`,
        fileName: sanitizedFileName,
        size: file.size,
      });
    } catch {
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: sanitizedFileName,
        size: file.size,
      });
    }
  } catch (error: any) {
    console.error("Admin file upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
