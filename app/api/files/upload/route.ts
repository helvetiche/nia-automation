import { NextRequest, NextResponse } from "next/server";
import { adminStorage, adminDb } from "@/lib/firebase/adminConfig";
import { verifyOperator } from "@/lib/auth/middleware";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 20;

export async function POST(request: NextRequest) {
  try {
    console.log("Upload request received");

    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      console.log("No authorization token provided");
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;
    console.log("User authenticated:", userId);

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folderId = formData.get("folderId") as string | null;

    console.log("Files received:", files.length);
    console.log("Folder ID:", folderId);

    if (!files || files.length === 0) {
      console.log("No files provided in request");
      return NextResponse.json({ error: "no files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      console.log("Too many files:", files.length);
      return NextResponse.json(
        { error: `max ${MAX_FILES_PER_UPLOAD} files per upload` },
        { status: 400 },
      );
    }

    for (const file of files) {
      console.log(
        "Processing file:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type,
      );

      if (!file.name.endsWith(".pdf")) {
        console.log("Non-PDF file rejected:", file.name);
        return NextResponse.json(
          { error: `file ${file.name} must be a PDF` },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        console.log("File too large:", file.name, file.size);
        return NextResponse.json(
          { error: `file ${file.name} too large (max 50MB)` },
          { status: 400 },
        );
      }
    }

    if (folderId) {
      console.log("Checking folder:", folderId);
      const folderDoc = await adminDb()
        .collection("folders")
        .doc(folderId)
        .get();
      if (!folderDoc.exists) {
        console.log("Folder not found:", folderId);
        return NextResponse.json(
          { error: "folder not found" },
          { status: 404 },
        );
      }
      if (folderDoc.data()?.userId !== userId) {
        console.log("Folder access denied for user:", userId);
        return NextResponse.json({ error: "not authorized" }, { status: 403 });
      }
    }

    const bucket = adminStorage().bucket();
    const uploadedFiles = [];
    const batch = adminDb().batch();

    for (const file of files) {
      console.log("Uploading file:", file.name);

      const buffer = Buffer.from(await file.arrayBuffer());
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `pdfs/${userId}/${timestamp}_${sanitizedName}`;
      const fileRef = bucket.file(fileName);

      await fileRef.save(buffer, {
        contentType: "application/pdf",
        metadata: {
          userId,
          originalName: file.name,
          uploadedAt: timestamp.toString(),
        },
      });

      const [url] = await fileRef.getSignedUrl({
        action: "read",
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      });

      const pdfRef = adminDb().collection("pdfs").doc();
      batch.set(pdfRef, {
        name: file.name,
        folderId: folderId || null,
        status: "unscanned",
        uploadedAt: timestamp,
        storageUrl: url,
        storagePath: fileName,
        fileSize: file.size,
        userId,
      });

      uploadedFiles.push({ id: pdfRef.id, name: file.name });
    }

    await batch.commit();
    console.log(
      "Upload completed successfully:",
      uploadedFiles.length,
      "files",
    );

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error("upload error:", error);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}

export const maxDuration = 60;
