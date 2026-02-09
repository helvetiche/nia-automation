import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminConfig";
import { getAuth } from "firebase-admin/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const db = adminDb();
    const settingsDoc = await db.collection("reportSettings").doc(userId).get();

    if (!settingsDoc.exists) {
      return NextResponse.json({
        boldKeywords: [],
        capitalizeKeywords: [],
      });
    }

    return NextResponse.json(settingsDoc.data());
  } catch (error) {
    console.error("fetch settings failed:", error);
    return NextResponse.json({ error: "server is broken" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { boldKeywords = [], capitalizeKeywords = [] } = body;

    if (!Array.isArray(boldKeywords) || !Array.isArray(capitalizeKeywords)) {
      return NextResponse.json(
        { error: "invalid keywords format" },
        { status: 400 },
      );
    }

    const db = adminDb();
    await db.collection("reportSettings").doc(userId).set({
      userId,
      boldKeywords,
      capitalizeKeywords,
      updatedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      boldKeywords,
      capitalizeKeywords,
    });
  } catch (error) {
    console.error("save settings failed:", error);
    return NextResponse.json({ error: "server is broken" }, { status: 500 });
  }
}
