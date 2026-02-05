import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/adminConfig';
import { verifyOperator } from '@/lib/auth/middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const { id: folderId } = await params;
    const { notice } = await request.json();

    if (!folderId) {
      return NextResponse.json({ error: 'folder id required' }, { status: 400 });
    }

    if (notice && typeof notice !== 'string') {
      return NextResponse.json({ error: 'notice must be a string' }, { status: 400 });
    }

    if (notice && notice.length > 100) {
      return NextResponse.json({ error: 'notice too long (max 100 characters)' }, { status: 400 });
    }

    const folderDoc = await adminDb().collection('folders').doc(folderId).get();
    if (!folderDoc.exists) {
      return NextResponse.json({ error: 'folder not found' }, { status: 404 });
    }

    const folderData = folderDoc.data();
    if (folderData?.userId !== userId) {
      return NextResponse.json({ error: 'not authorized' }, { status: 403 });
    }

    const updateData = notice && notice.trim() 
      ? { notice: notice.trim() }
      : { notice: null };

    await adminDb().collection('folders').doc(folderId).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('folder notice update error:', error);
    return NextResponse.json({ error: 'server is broken' }, { status: 500 });
  }
}