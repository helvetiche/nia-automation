import { NextRequest, NextResponse } from 'next/server';
import { verifyOperator } from '@/lib/auth/middleware';
import { adminDb } from '@/lib/firebase/adminConfig';
import type { Folder, PdfFile } from '@/types';

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const { pdfId, targetFolderId } = await request.json();

    if (!pdfId || typeof pdfId !== 'string') {
      return NextResponse.json({ error: 'invalid pdf id' }, { status: 400 });
    }

    if (targetFolderId !== null && typeof targetFolderId !== 'string') {
      return NextResponse.json({ error: 'invalid folder id' }, { status: 400 });
    }

    const db = adminDb();
    const pdfRef = db.collection('pdfs').doc(pdfId);
    const pdfDoc = await pdfRef.get();

    if (!pdfDoc.exists) {
      return NextResponse.json({ error: 'pdf not found' }, { status: 404 });
    }

    if (pdfDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: 'not authorized' }, { status: 403 });
    }

    await pdfRef.update({
      folderId: targetFolderId || null,
    });

    try {
      const { calculateFolderTotals } = await import('@/lib/folderCalculations');
      
      const foldersSnapshot = await db
        .collection('folders')
        .where('userId', '==', userId)
        .get();

      const filesSnapshot = await db
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

      const folderBatch = db.batch();
      
      for (const folder of allFolders) {
        const totals = calculateFolderTotals(folder.id, allFolders, allFiles);
        
        folderBatch.update(db.collection('folders').doc(folder.id), {
          totalArea: totals.totalArea || 0,
          totalIrrigatedArea: totals.totalIrrigatedArea || 0,
          totalPlantedArea: totals.totalPlantedArea || 0,
        });
      }

      await folderBatch.commit();
    } catch (folderError) {
      console.error('Folder update error (non-critical):', folderError);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('move pdf failed:', error);
    return NextResponse.json({ error: 'server is broken' }, { status: 500 });
  }
}
