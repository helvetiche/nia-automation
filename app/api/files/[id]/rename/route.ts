import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminConfig";
import { requireOperator } from "@/lib/auth/guards";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const { newName, associationId } = await request.json();

    if (typeof newName !== "string" || newName.trim().length === 0) {
      return NextResponse.json({ error: "invalid name" }, { status: 400 });
    }

    const db = adminDb();
    const fileRef = db.collection("pdfs").doc(id);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      return NextResponse.json({ error: "file not found" }, { status: 404 });
    }

    const fileData = fileDoc.data();

    if (associationId) {
      if (!fileData?.summaryData || !Array.isArray(fileData.summaryData)) {
        return NextResponse.json(
          { error: "no summary data found" },
          { status: 400 },
        );
      }

      const summaryData = [...fileData.summaryData];
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
        name: newName.trim(),
      };

      await fileRef.update({ summaryData });
    } else {
      await fileRef.update({ name: newName.trim() });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("rename broken:", error);
    return NextResponse.json({ error: "server broken" }, { status: 500 });
  }
}
