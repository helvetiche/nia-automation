import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminConfig";

function capitalizeAssociation(name: string): string {
  const exceptions = ["NON-IA", "NON - IA", "NON IA", "NONIA"];

  const upperName = name.toUpperCase();
  if (exceptions.some((exc) => upperName.includes(exc))) {
    return name.toUpperCase();
  }

  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const folderId = request.nextUrl.searchParams.get("folderId");
    const folderIds = request.nextUrl.searchParams.get("folderIds");
    const fileIds = request.nextUrl.searchParams.get("fileIds");
    const title =
      request.nextUrl.searchParams.get("title") ||
      "LIST OF IRRIGATED AND PLANTED AREA (LIPA)";
    const season =
      request.nextUrl.searchParams.get("season") || "DRY CROPPING SEASON 2025";

    if (!folderId && !folderIds && !fileIds) {
      return NextResponse.json(
        { error: "folderId, folderIds, or fileIds required" },
        { status: 400 },
      );
    }

    const db = adminDb();

    const allDivisions: {
      divisionName: string;
      irrigators: { no: number; name: string; totalPlantedArea: number }[];
      total: number;
    }[] = [];

    if (fileIds) {
      const targetFileIds = fileIds.split(",");

      for (const fileId of targetFileIds) {
        const fileDoc = await db.collection("pdfs").doc(fileId).get();
        if (!fileDoc.exists) continue;

        const fileData = fileDoc.data();
        if (!fileData) continue;

        const summaryData = fileData.summaryData || [];

        const irrigators = summaryData.map(
          (item: { name: string; totalArea: number }, index: number) => ({
            no: index + 1,
            name: capitalizeAssociation(item.name),
            totalPlantedArea: item.totalArea || 0,
          }),
        );

        const total = irrigators.reduce(
          (sum: number, irr: { totalPlantedArea: number }) =>
            sum + irr.totalPlantedArea,
          0,
        );

        allDivisions.push({
          divisionName: fileData.name || "Untitled File",
          irrigators,
          total,
        });
      }
    } else {
      const targetFolderIds = folderIds ? folderIds.split(",") : [folderId!];

      for (const targetFolderId of targetFolderIds) {
        const folderDoc = await db
          .collection("folders")
          .doc(targetFolderId)
          .get();
        if (!folderDoc.exists) continue;

        const subFoldersSnapshot = await db
          .collection("folders")
          .where("parentId", "==", targetFolderId)
          .orderBy("name")
          .get();

        const divisions = await Promise.all(
          subFoldersSnapshot.docs.map(async (divisionDoc) => {
            const divisionData = divisionDoc.data();

            const filesSnapshot = await db
              .collection("pdfs")
              .where("folderId", "==", divisionDoc.id)
              .where("status", "==", "summary-scanned")
              .get();

            const irrigators = filesSnapshot.docs.flatMap(
              (fileDoc, fileIndex) => {
                const fileData = fileDoc.data();
                const summaryData = fileData.summaryData || [];

                return summaryData.map(
                  (
                    item: { name: string; totalArea: number },
                    index: number,
                  ) => ({
                    no: fileIndex + index + 1,
                    name: capitalizeAssociation(item.name),
                    totalPlantedArea: item.totalArea || 0,
                  }),
                );
              },
            );

            const total = irrigators.reduce(
              (sum, irr) => sum + irr.totalPlantedArea,
              0,
            );

            return {
              divisionName: divisionData.name || "DIVISION",
              irrigators,
              total,
            };
          }),
        );

        allDivisions.push(...divisions);
      }
    }

    const reportData = {
      title,
      season,
      divisions: allDivisions,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("preview generation broken:", error);
    return NextResponse.json({ error: "server broken" }, { status: 500 });
  }
}
