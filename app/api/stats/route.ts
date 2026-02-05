import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/adminConfig';
import { verifyOperator } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    await verifyOperator(token);

    const metricsDoc = await adminDb().collection('usage').doc('metrics').get();
    
    if (!metricsDoc.exists) {
      return NextResponse.json({
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        scannedCount: 0,
        averageCostPerScan: 0,
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    const metricsData = metricsDoc.data();
    const totalInputTokens = metricsData?.inputTokens || 0;
    const totalOutputTokens = metricsData?.outputTokens || 0;
    const totalCost = metricsData?.totalCost || 0;

    const pdfsSnapshot = await adminDb()
      .collection('pdfs')
      .where('status', '==', 'scanned')
      .get();

    const scannedCount = pdfsSnapshot.size;

    return NextResponse.json({
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      totalCost,
      scannedCount,
      averageCostPerScan: scannedCount > 0 ? totalCost / scannedCount : 0,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('stats fetch error:', error);
    return NextResponse.json({ error: 'server is broken' }, { status: 500 });
  }
}
