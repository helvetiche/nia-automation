import { NextRequest, NextResponse } from "next/server";
import { requireOperator } from "@/lib/auth/guards";
import {
  createFileBatch,
  getFolderById,
} from "@/lib/services/firestoreService";
import {
  sanitizeFileName,
  sanitizeFolderId,
  validateFileUpload,
} from "@/lib/validation/sanitize";
import type { PdfFile } from "@/types";

const MAX_FILES_PER_UPLOAD = 20;

export async function POST(request: NextRequest) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;

  const userId = authResult.user.uid;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const displayNames = formData.getAll("displayNames") as string[];
    const rawFolderId = formData.get("folderId") as string | null;

    const folderId = sanitizeFolderId(rawFolderId);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "no files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return NextResponse.json(
        { error: `max ${MAX_FILES_PER_UPLOAD} files per upload` },
        { status: 400 },
      );
    }

    for (const file of files) {
      const validation = validateFileUpload(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `${file.name}: ${validation.error}` },
          { status: 400 },
        );
      }
    }

    if (folderId) {
      const folder = await getFolderById(folderId);
      if (!folder) {
        return NextResponse.json(
          { error: "folder not found" },
          { status: 404 },
        );
      }
      if (folder.userId !== userId) {
        return NextResponse.json({ error: "not authorized" }, { status: 403 });
      }
    }

    const timestamp = Date.now();
    const filesData: Omit<PdfFile, "id">[] = files.map((file, i) => {
      const rawDisplayName = displayNames[i] || file.name;
      const sanitizedName = sanitizeFileName(rawDisplayName);
      const finalName = sanitizedName.endsWith(".pdf")
        ? sanitizedName
        : `${sanitizedName}.pdf`;

      return {
        name: finalName,
        folderId: folderId || "",
        status: "unscanned" as const,
        uploadedAt: timestamp,
        fileSize: file.size,
        userId,
      };
    });

    const fileIds = await createFileBatch(filesData);

    const uploadedFiles = fileIds.map((id, i) => ({
      id,
      name: filesData[i].name,
    }));

    return NextResponse.json({ files: uploadedFiles });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}

export const maxDuration = 60;
