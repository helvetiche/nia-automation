import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminConfig";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { newArea, associationId } = await request.json();

    if (typeof newArea !== "number" || newArea < 0) {
      return NextResponse.json({ error: "invalid area value" }, { status: 400 });
    }

    const db = adminDb();
    const fileRef = db.collection("pdfs").doc(id);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      return NextResponse.json({ error: "file not found" }, { status: 404 });
    }

    const fileData = fileDoc.data();
    if (!fileData?.summaryData || !Array.isArray(fileData.summaryData)) {
      return NextResponse.json(
        { error: "no summary data found" },
        { status: 400 },
      );
    }

    const summaryData = [...fileData.summaryData];

    if (associationId) {
      const associationIndex = summaryData.findIndex(
        (assoc) => assoc.id === associationId,
      );

      if (associationIndex === -1) {
        return NextResponse.json(
          { error: "association not found" },
          { status: 404 },
        );
      }

      summaryData[associationIndex] = {
        ...summaryData[associationIndex],
        totalArea: newArea,
      };
    } else {
      const totalArea = summaryData.reduce(
        (sum, assoc) => sum + assoc.totalArea,
        0,
      );
      const ratio = newArea / totalArea;

      summaryData.forEach((assoc, index) => {
        summaryData[index] = {
          ...assoc,
          totalArea: assoc.totalArea * ratio,
        };
      });
    }

    await fileRef.update({ summaryData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("area update broken:", error);
    return NextResponse.json({ error: "server broken" }, { status: 500 });
  }
}
