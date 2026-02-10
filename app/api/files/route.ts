import { NextRequest, NextResponse } from "next/server";
import { requireOperator } from "@/lib/auth/guards";
import {
  getFilesByFolder,
  getFileById,
  deleteFileWithRollback,
  getFoldersByUser,
  updateFoldersBatch,
} from "@/lib/services/firestoreService";
import { sanitizeFolderId, sanitizeNumber } from "@/lib/validation/sanitize";
import { calculateFolderTotals } from "@/lib/folderCalculations";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";

export async function GET(request: NextRequest) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;

  const userId = authResult.user.uid;

  try {
    const rawFolderId = request.nextUrl.searchParams.get("folderId");
    const rawLimit = request.nextUrl.searchParams.get("limit");

    const folderId = sanitizeFolderId(rawFolderId);
    const limit = sanitizeNumber(rawLimit, 1, 100);

    const files = await getFilesByFolder(userId, folderId, limit);

    return NextResponse.json(
      { files },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;

  const userId = authResult.user.uid;

  try {
    const rawPdfId = request.nextUrl.searchParams.get("id");
    const pdfId = sanitizeFolderId(rawPdfId);

    if (!pdfId) {
      return NextResponse.json({ error: "pdf id required" }, { status: 400 });
    }

    const pdfFile = await getFileById(pdfId);

    if (!pdfFile) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_FOUND },
        { status: 404 },
      );
    }

    if (pdfFile.userId !== userId) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 403 },
      );
    }

    await deleteFileWithRollback(pdfId, userId);

    try {
      const allFolders = await getFoldersByUser(userId);
      const allFiles = await getFilesByFolder(userId, null, 1000);

      const folderUpdates = allFolders.map((folder) => {
        const totals = calculateFolderTotals(folder.id, allFolders, allFiles);
        return {
          id: folder.id,
          data: {
            totalArea: totals.totalArea || 0,
            totalIrrigatedArea: totals.totalIrrigatedArea || 0,
            totalPlantedArea: totals.totalPlantedArea || 0,
          },
        };
      });

      await updateFoldersBatch(folderUpdates);
    } catch {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: ERROR_MESSAGES.DELETE_FAILED },
      { status: 500 },
    );
  }
}
