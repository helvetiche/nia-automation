import { NextRequest, NextResponse } from "next/server";
import { verifyOperator } from "@/lib/auth/middleware";
import {
  getUsageMetrics,
  updateUsageMetrics,
} from "@/lib/services/firestoreService";
import { sanitizeNumber } from "@/lib/validation/sanitize";
import { adminDb } from "@/lib/firebase/adminConfig";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    await verifyOperator(token);

    const metricsData = await getUsageMetrics();

    if (!metricsData) {
      return NextResponse.json(
        {
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalTokens: 0,
          totalCost: 0,
          scannedCount: 0,
          averageCostPerScan: 0,
          usageLimit: 1000,
        },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
    }

    const totalInputTokens = metricsData.inputTokens || 0;
    const totalOutputTokens = metricsData.outputTokens || 0;
    const totalCost = metricsData.totalCost || 0;
    const usageLimit = metricsData.usageLimit || 1000;

    const pdfsSnapshot = await adminDb()
      .collection("pdfs")
      .where("status", "==", "scanned")
      .get();

    const scannedCount = pdfsSnapshot.size;

    return NextResponse.json(
      {
        totalInputTokens,
        totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
        totalCost,
        scannedCount,
        averageCostPerScan: scannedCount > 0 ? totalCost / scannedCount : 0,
        usageLimit,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "server is broken" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    await verifyOperator(token);

    const body = await request.json();
    const usageLimit = sanitizeNumber(body.usageLimit, 0, 1000000);

    await updateUsageMetrics({ usageLimit });

    return NextResponse.json({ success: true, usageLimit });
  } catch {
    return NextResponse.json({ error: "server is broken" }, { status: 500 });
  }
}
