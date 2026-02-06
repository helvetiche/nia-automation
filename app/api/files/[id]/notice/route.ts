import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminConfig";
import { verifyOperator } from "@/lib/auth/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const { id: fileId } = await params;
    const { notice, summaryId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "file id required" }, { status: 400 });
    }

    if (notice && typeof notice !== "string") {
      return NextResponse.json(
        { error: "notice must be a string" },
        { status: 400 },
      );
    }

    if (notice && notice.length > 100) {
      return NextResponse.json(
        { error: "notice too long (max 100 characters)" },
        { status: 400 },
      );
    }

    const fileDoc = await adminDb().collection("pdfs").doc(fileId).get();
    if (!fileDoc.exists) {
      return NextResponse.json({ error: "file not found" }, { status: 404 });
    }

    const fileData = fileDoc.data();
    if (fileData?.userId !== userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 403 });
    }

    if (summaryId) {
      const summaryData = fileData?.summaryData || [];
      const updatedSummaryData = summaryData.map(
        (item: { id: string; notice?: string }) => {
          if (item.id === summaryId) {
            return {
              ...item,
              notice: notice && notice.trim() ? notice.trim() : undefined,
            };
          }
          return item;
        },
      );

      await adminDb().collection("pdfs").doc(fileId).update({
        summaryData: updatedSummaryData,
      });
    } else {
      const updateData =
        notice && notice.trim() ? { notice: notice.trim() } : { notice: null };

      await adminDb().collection("pdfs").doc(fileId).update(updateData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("file notice update error:", error);
    return NextResponse.json({ error: "server is broken" }, { status: 500 });
  }
}
