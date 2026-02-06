import { NextRequest, NextResponse } from "next/server";
import { adminStorage, adminDb } from "@/lib/firebase/adminConfig";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const templateName = formData.get("name") as string;

    if (!file || !templateName) {
      return NextResponse.json(
        { error: "file and name required" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = adminStorage();
    const bucket = storage.bucket();
    const fileName = `templates/${Date.now()}_${file.name}`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: {
        originalName: file.name,
      },
    });

    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });

    const db = adminDb();
    const templateDoc = await db.collection("templates").add({
      name: templateName,
      fileName: file.name,
      storageUrl: url,
      storagePath: fileName,
      uploadedAt: Date.now(),
      type: "excel",
    });

    return NextResponse.json({
      success: true,
      templateId: templateDoc.id,
    });
  } catch (error) {
    console.error("template upload broken:", error);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
