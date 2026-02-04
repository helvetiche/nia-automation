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

    const snapshot = await adminDb()
      .collection('folders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'asc')
      .get();

    const folders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { folders },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('folder fetch error:', error);
    return NextResponse.json({ error: 'something broke' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const { name, parentId } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'folder name required' }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'folder name too long' }, { status: 400 });
    }

    let level = 1;
    if (parentId) {
      const parentDoc = await adminDb().collection('folders').doc(parentId).get();
      if (!parentDoc.exists) {
        return NextResponse.json({ error: 'parent folder not found' }, { status: 404 });
      }
      const parentData = parentDoc.data();
      
      if (parentData?.userId !== userId) {
        return NextResponse.json({ error: 'not authorized' }, { status: 403 });
      }

      level = (parentData?.level || 0) + 1;

      if (level > 4) {
        return NextResponse.json(
          { error: 'max folder depth reached (4 levels)' },
          { status: 400 }
        );
      }
    }

    const folderRef = await adminDb().collection('folders').add({
      name: name.trim(),
      parentId: parentId || null,
      level,
      createdAt: Date.now(),
      userId,
    });

    return NextResponse.json({ id: folderRef.id });
  } catch (error) {
    console.error('folder creation error:', error);
    return NextResponse.json({ error: 'something broke' }, { status: 500 });
  }
}
