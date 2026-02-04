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

    const folderId = request.nextUrl.searchParams.get('folderId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

    if (limit > 100) {
      return NextResponse.json({ error: 'limit too high (max 100)' }, { status: 400 });
    }

    let query = adminDb()
      .collection('pdfs')
      .where('userId', '==', userId);

    if (folderId) {
      query = query.where('folderId', '==', folderId);
    } else {
      query = query.where('folderId', '==', null);
    }

    const snapshot = await query
      .orderBy('uploadedAt', 'desc')
      .limit(limit)
      .get();

    const files = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { files },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('file fetch error:', error);
    return NextResponse.json({ error: 'something broke' }, { status: 500 });
  }
}
