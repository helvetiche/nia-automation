import { NextRequest, NextResponse } from "next/server";
import { verifyOperator } from "@/lib/auth/middleware";
import {
  getFoldersByUser,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolderWithContents,
} from "@/lib/services/firestoreService";
import {
  sanitizeString,
  sanitizeFolderId,
  validateRequired,
} from "@/lib/validation/sanitize";

const VALID_COLORS = [
  "red",
  "orange",
  "yellow",
  "emerald",
  "blue",
  "indigo",
  "purple",
  "pink",
];

const MAX_FOLDER_DEPTH = 4;

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const folders = await getFoldersByUser(userId);

    return NextResponse.json(
      { folders },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "something broke" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const name = sanitizeString(body.name, 100);
    const rawParentId = body.parentId;
    const color = body.color;
    const icon = body.icon;
    const description = sanitizeString(body.description, 50);

    const validation = validateRequired({ name });
    if (!validation.valid) {
      return NextResponse.json(
        { error: "folder name required" },
        { status: 400 },
      );
    }

    if (color && !VALID_COLORS.includes(color)) {
      return NextResponse.json({ error: "invalid color" }, { status: 400 });
    }

    let level = 1;
    let parentId: string | null = null;

    if (rawParentId) {
      parentId = sanitizeFolderId(rawParentId);
      if (!parentId) {
        return NextResponse.json(
          { error: "invalid parent folder id" },
          { status: 400 },
        );
      }

      const parentFolder = await getFolderById(parentId);
      if (!parentFolder) {
        return NextResponse.json(
          { error: "parent folder not found" },
          { status: 404 },
        );
      }

      if (parentFolder.userId !== userId) {
        return NextResponse.json({ error: "not authorized" }, { status: 403 });
      }

      level = (parentFolder.level || 0) + 1;

      if (level > MAX_FOLDER_DEPTH) {
        return NextResponse.json(
          { error: `max folder depth reached (${MAX_FOLDER_DEPTH} levels)` },
          { status: 400 },
        );
      }
    }

    const folderData = {
      name,
      parentId,
      level,
      createdAt: Date.now(),
      userId,
      color: color || "blue",
      icon: icon || "Folder",
      ...(description && { description }),
    };

    const folderId = await createFolder(folderData);

    return NextResponse.json({ id: folderId });
  } catch {
    return NextResponse.json({ error: "something broke" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const rawFolderId = request.nextUrl.searchParams.get("id");
    const folderId = sanitizeFolderId(rawFolderId);

    if (!folderId) {
      return NextResponse.json(
        { error: "folder id required" },
        { status: 400 },
      );
    }

    const folder = await getFolderById(folderId);

    if (!folder) {
      return NextResponse.json({ error: "folder not found" }, { status: 404 });
    }

    if (folder.userId !== userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 403 });
    }

    await deleteFolderWithContents(folderId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "something broke" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const rawFolderId = request.nextUrl.searchParams.get("id");
    const folderId = sanitizeFolderId(rawFolderId);

    if (!folderId) {
      return NextResponse.json(
        { error: "folder id required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const rawParentId = body.parentId;

    const folder = await getFolderById(folderId);

    if (!folder) {
      return NextResponse.json({ error: "folder not found" }, { status: 404 });
    }

    if (folder.userId !== userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 403 });
    }

    let level = 1;
    let parentId: string | null = null;

    if (rawParentId) {
      parentId = sanitizeFolderId(rawParentId);
      if (!parentId) {
        return NextResponse.json(
          { error: "invalid parent folder id" },
          { status: 400 },
        );
      }

      const parentFolder = await getFolderById(parentId);
      if (!parentFolder) {
        return NextResponse.json(
          { error: "parent folder not found" },
          { status: 404 },
        );
      }

      if (parentFolder.userId !== userId) {
        return NextResponse.json({ error: "not authorized" }, { status: 403 });
      }

      level = (parentFolder.level || 0) + 1;

      if (level > MAX_FOLDER_DEPTH) {
        return NextResponse.json(
          { error: `max folder depth reached (${MAX_FOLDER_DEPTH} levels)` },
          { status: 400 },
        );
      }
    }

    await updateFolder(folderId, { parentId, level });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "something broke" }, { status: 500 });
  }
}
