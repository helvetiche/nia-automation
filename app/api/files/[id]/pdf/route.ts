import { NextRequest, NextResponse } from 'next/server';
import { adminStorage, adminDb } from '@/lib/firebase/adminConfig';
import { verifyOperator } from '@/lib/auth/middleware';

export async function GET(
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

    const { id: pdfId } = await params;
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

    const bucket = adminStorage().bucket();
    const file = bucket.file(pdfData.storagePath);
    
    const [fileBuffer] = await file.download();
    
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('PDF serve error:', error);
    return NextResponse.json({ error: 'server is broken' }, { status: 500 });
  }
}

export const maxDuration = 60;