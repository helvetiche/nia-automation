import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminConfig";
import { requireOperator } from "@/lib/auth/guards";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;

    const db = adminDb();
    const fileRef = db.collection("pdfs").doc(id);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      return NextResponse.json({ error: "file not found" }, { status: 404 });
    }

    const fileData = fileDoc.data();

    if (!fileData?.summaryData || !Array.isArray(fileData.summaryData)) {
      return NextResponse.json(
        { error: "file is not summary scanned" },
        { status: 400 },
      );
    }

    const summaryData = [...fileData.summaryData];
    const newAssociationId = `${id}-${summaryData.length}`;

    const newAssociation = {
      id: newAssociationId,
      name: "",
      totalArea: 0,
      confidence: 100,
      usage: 0,
    };

    summaryData.push(newAssociation);

    await fileRef.update({ summaryData });

    return NextResponse.json({ success: true, association: newAssociation });
  } catch (error) {
    console.error("add association broken:", error);
    return NextResponse.json({ error: "server broken" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { id } = await params;
    const { associationId } = await request.json();

    if (!associationId) {
      return NextResponse.json(
        { error: "association id required" },
        { status: 400 },
      );
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

    const summaryData = fileData.summaryData.filter(
      (assoc) => assoc.id !== associationId,
    );

    await fileRef.update({ summaryData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete association broken:", error);
    return NextResponse.json({ error: "server broken" }, { status: 500 });
  }
}
