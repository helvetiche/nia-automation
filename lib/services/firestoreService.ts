import { adminDb } from "@/lib/firebase/adminConfig";
import type { Folder, PdfFile, Template, ReportSettings } from "@/types";
import { Firestore } from "firebase-admin/firestore";

const db = (): Firestore => adminDb();

export async function getFoldersByUser(userId: string): Promise<Folder[]> {
  const snapshot = await db()
    .collection("folders")
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Folder[];
}

export async function getFolderById(folderId: string): Promise<Folder | null> {
  const doc = await db().collection("folders").doc(folderId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as Folder;
}

export async function createFolder(
  folderData: Omit<Folder, "id">,
): Promise<string> {
  const folderRef = await db().collection("folders").add(folderData);
  return folderRef.id;
}

export async function updateFolder(
  folderId: string,
  data: Partial<Folder>,
): Promise<void> {
  await db().collection("folders").doc(folderId).update(data);
}

export async function deleteFolderWithContents(folderId: string): Promise<void> {
  const batch = db().batch();

  const subfolders = await db()
    .collection("folders")
    .where("parentId", "==", folderId)
    .get();

  subfolders.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  const files = await db()
    .collection("pdfs")
    .where("folderId", "==", folderId)
    .get();

  files.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  batch.delete(db().collection("folders").doc(folderId));

  await batch.commit();
}

export async function getFilesByFolder(
  userId: string,
  folderId: string | null,
  limit = 50,
): Promise<PdfFile[]> {
  let query = db().collection("pdfs").where("userId", "==", userId);

  if (folderId) {
    query = query.where("folderId", "==", folderId);
  } else {
    query = query.where("folderId", "==", null);
  }

  const snapshot = await query.orderBy("uploadedAt", "desc").limit(limit).get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PdfFile[];
}

export async function getFileById(fileId: string): Promise<PdfFile | null> {
  const doc = await db().collection("pdfs").doc(fileId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as PdfFile;
}

export async function createFile(
  fileData: Omit<PdfFile, "id">,
): Promise<string> {
  const fileRef = await db().collection("pdfs").doc();
  await fileRef.set(fileData);
  return fileRef.id;
}

export async function createFileBatch(
  filesData: Omit<PdfFile, "id">[],
): Promise<string[]> {
  const batch = db().batch();
  const ids: string[] = [];

  filesData.forEach((fileData) => {
    const fileRef = db().collection("pdfs").doc();
    batch.set(fileRef, fileData);
    ids.push(fileRef.id);
  });

  await batch.commit();
  return ids;
}

export async function updateFile(
  fileId: string,
  data: Partial<PdfFile>,
): Promise<void> {
  await db().collection("pdfs").doc(fileId).update(data);
}

export async function deleteFileWithRollback(
  fileId: string,
  userId: string,
): Promise<void> {
  const file = await getFileById(fileId);
  
  if (!file) {
    throw new Error("file not found");
  }
  
  if (file.userId !== userId) {
    throw new Error("not authorized");
  }

  await db().collection("pdfs").doc(fileId).delete();
}

export async function updateFoldersBatch(
  updates: Array<{ id: string; data: Partial<Folder> }>,
): Promise<void> {
  const batch = db().batch();

  updates.forEach(({ id, data }) => {
    batch.update(db().collection("folders").doc(id), data);
  });

  await batch.commit();
}

export async function getTemplates(): Promise<Template[]> {
  const snapshot = await db().collection("templates").get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Template[];
}

export async function getReportSettings(
  userId: string,
): Promise<ReportSettings | null> {
  const doc = await db().collection("reportSettings").doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as ReportSettings;
}

export async function updateReportSettings(
  userId: string,
  data: Partial<ReportSettings>,
): Promise<void> {
  await db().collection("reportSettings").doc(userId).set(data, { merge: true });
}

export async function getUsageMetrics() {
  const doc = await db().collection("usage").doc("metrics").get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
}

export async function updateUsageMetrics(data: Record<string, unknown>) {
  const metricsRef = db().collection("usage").doc("metrics");
  await metricsRef.set(data, { merge: true });
}

export async function incrementUsageMetrics(
  inputTokens: number,
  outputTokens: number,
  cost: number,
) {
  const metricsRef = db().collection("usage").doc("metrics");

  await db().runTransaction(async (transaction) => {
    const metricsDoc = await transaction.get(metricsRef);

    if (!metricsDoc.exists) {
      transaction.set(metricsRef, {
        totalInputTokens: inputTokens,
        totalOutputTokens: outputTokens,
        totalCost: cost,
        lastUpdated: Date.now(),
      });
    } else {
      const current = metricsDoc.data();
      transaction.update(metricsRef, {
        totalInputTokens: (current?.totalInputTokens || 0) + inputTokens,
        totalOutputTokens: (current?.totalOutputTokens || 0) + outputTokens,
        totalCost: (current?.totalCost || 0) + cost,
        lastUpdated: Date.now(),
      });
    }
  });
}
