import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/adminConfig';
import { verifyOperator } from '@/lib/auth/middleware';
import type { Folder, PdfFile } from '@/types';

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
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('file fetch error:', error);
    return NextResponse.json({ error: 'something broke' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const pdfId = request.nextUrl.searchParams.get('id');

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

    const storagePath = pdfData.storagePath;

    if (storagePath) {
      try {
        const bucket = adminStorage().bucket();
        const file = bucket.file(storagePath);
        await file.delete();
      } catch (storageError) {
        console.error('storage delete error:', storageError);
      }
    }

    await adminDb().collection('pdfs').doc(pdfId).delete();

    try {
      const { calculateFolderTotals } = await import('@/lib/folderCalculations');
      
      const foldersSnapshot = await adminDb()
        .collection('folders')
        .where('userId', '==', userId)
        .get();

      const filesSnapshot = await adminDb()
        .collection('pdfs')
        .where('userId', '==', userId)
        .get();

      const allFolders = foldersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Folder[];

      const allFiles = filesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PdfFile[];

      const folderBatch = adminDb().batch();
      
      for (const folder of allFolders) {
        const totals = calculateFolderTotals(folder.id, allFolders, allFiles);
        
        folderBatch.update(adminDb().collection('folders').doc(folder.id), {
          totalArea: totals.totalArea || 0,
          totalIrrigatedArea: totals.totalIrrigatedArea || 0,
          totalPlantedArea: totals.totalPlantedArea || 0,
        });
      }

      await folderBatch.commit();
    } catch (folderError) {
      console.error('Folder update error (non-critical):', folderError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('delete error:', error);
    return NextResponse.json({ error: 'delete failed' }, { status: 500 });
  }
}
