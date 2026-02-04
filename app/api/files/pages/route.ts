import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/adminConfig';
import { verifyOperator } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const pdfId = request.nextUrl.searchParams.get('pdfId');

    if (!pdfId) {
      return NextResponse.json({ error: 'pdf id required' }, { status: 400 });
    }

    const pdfDoc = await adminDb().collection('pdfs').doc(pdfId).get();
    if (!pdfDoc.exists) {
      return NextResponse.json({ error: 'pdf not found' }, { status: 404 });
    }

    if (pdfDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: 'not authorized' }, { status: 403 });
    }

    const snapshot = await adminDb()
      .collection('pages')
      .where('pdfId', '==', pdfId)
      .orderBy('pageNumber', 'asc')
      .get();

    const pages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { pages },
      {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('pages fetch error:', error);
    return NextResponse.json({ error: 'something broke' }, { status: 500 });
  }
}
