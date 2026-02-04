import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/adminConfig';
import { verifyOperator } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const { pdfId } = await request.json();

    if (!pdfId) {
      return NextResponse.json({ error: 'pdf id required' }, { status: 400 });
    }

    const pdfDoc = await adminDb().collection('pdfs').doc(pdfId).get();
    if (!pdfDoc.exists) {
      return NextResponse.json({ error: 'pdf not found' }, { status: 404 });
    }

    const pdfData = pdfDoc.data();
    if (pdfData?.userId !== userId) {
      return NextResponse.json({ error: 'not authorized' }, { status: 403 });
    }

    if (pdfData?.status === 'scanned') {
      return NextResponse.json({ error: 'already scanned' }, { status: 400 });
    }

    const batch = adminDb().batch();
    const pageCount = 5;

    batch.update(adminDb().collection('pdfs').doc(pdfId), {
      status: 'scanned',
      scannedAt: Date.now(),
      pageCount,
    });

    for (let i = 1; i <= pageCount; i++) {
      const pageRef = adminDb().collection('pages').doc(`${pdfId}_page_${i}`);
      batch.set(pageRef, {
        pdfId,
        pageNumber: i,
        tableData: {
          sample: 'data',
          row: i,
          extracted: 'by AI',
        },
        screenshotUrl: `https://via.placeholder.com/800x1000?text=Page+${i}`,
        createdAt: Date.now(),
      });
    }

    await batch.commit();

    return NextResponse.json({ success: true, pageCount });
  } catch (error) {
    console.error('scan error:', error);
    return NextResponse.json({ error: 'scan failed' }, { status: 500 });
  }
}
