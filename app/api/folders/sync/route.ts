import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminConfig";
import { verifyOperator } from "@/lib/auth/middleware";
import type { PdfFile } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const { folderId } = await request.json();

    if (!folderId) {
      return NextResponse.json(
        { error: "folder id required" },
        { status: 400 },
      );
    }

    console.log("Syncing folder:", folderId);

    const folderDoc = await adminDb().collection("folders").doc(folderId).get();

    if (!folderDoc.exists) {
      return NextResponse.json({ error: "folder not found" }, { status: 404 });
    }

    if (folderDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 403 });
    }

    const filesSnapshot = await adminDb()
      .collection("pdfs")
      .where("userId", "==", userId)
      .where("folderId", "==", folderId)
      .get();

    const files: PdfFile[] = filesSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as PdfFile,
    );

    console.log(`Found ${files.length} files in folder`);

    let totalArea = 0;
    let totalIrrigatedArea = 0;
    let totalPlantedArea = 0;

    for (const file of files) {
      console.log(`File: ${file.name} (${file.status})`);

      if (file.status === "scanned") {
        console.log(`  - totalArea: ${file.totalArea}`);
        console.log(`  - totalIrrigatedArea: ${file.totalIrrigatedArea}`);
        console.log(`  - totalPlantedArea: ${file.totalPlantedArea}`);

        if (file.totalArea) totalArea += file.totalArea;
        if (file.totalIrrigatedArea)
          totalIrrigatedArea += file.totalIrrigatedArea;
        if (file.totalPlantedArea) totalPlantedArea += file.totalPlantedArea;
      } else if (file.status === "summary-scanned" && file.summaryData) {
        const summaryTotalArea = file.summaryData.reduce(
          (sum, assoc) => sum + assoc.totalArea,
          0,
        );
        console.log(
          `  - summaryTotalArea: ${summaryTotalArea} (from ${file.summaryData.length} associations)`,
        );
        totalArea += summaryTotalArea;
      }
    }

    console.log(
      `Folder totals - Area: ${totalArea}, Irrigated: ${totalIrrigatedArea}, Planted: ${totalPlantedArea}`,
    );

    await adminDb()
      .collection("folders")
      .doc(folderId)
      .update({
        totalArea: totalArea || 0,
        totalIrrigatedArea: totalIrrigatedArea || 0,
        totalPlantedArea: totalPlantedArea || 0,
      });

    return NextResponse.json({
      success: true,
      totalArea,
      totalIrrigatedArea,
      totalPlantedArea,
    });
  } catch (error) {
    console.error("folder sync error:", error);
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }
}
