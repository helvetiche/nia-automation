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
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
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

    const { name, parentId, color, icon, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'folder name required' }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'folder name too long' }, { status: 400 });
    }

    if (description && description.length > 50) {
      return NextResponse.json({ error: 'description must be 50 characters or less' }, { status: 400 });
    }

    const validColors = ['red', 'orange', 'yellow', 'emerald', 'blue', 'indigo', 'purple', 'pink'];
    if (color && !validColors.includes(color)) {
      return NextResponse.json({ error: 'invalid color' }, { status: 400 });
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

    const folderData: Record<string, unknown> = {
      name: name.trim(),
      parentId: parentId || null,
      level,
      createdAt: Date.now(),
      userId,
      color: color || 'blue',
      icon: icon || 'Folder',
    };

    if (description && description.trim()) {
      folderData.description = description.trim();
    }

    const folderRef = await adminDb().collection('folders').add(folderData);

    return NextResponse.json({ id: folderRef.id });
  } catch (error) {
    console.error('folder creation error:', error);
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

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('id');

    if (!folderId) {
      return NextResponse.json({ error: 'folder id required' }, { status: 400 });
    }

    const folderDoc = await adminDb().collection('folders').doc(folderId).get();
    
    if (!folderDoc.exists) {
      return NextResponse.json({ error: 'folder not found' }, { status: 404 });
    }

    const folderData = folderDoc.data();
    if (folderData?.userId !== userId) {
      return NextResponse.json({ error: 'not authorized' }, { status: 403 });
    }

    const batch = adminDb().batch();

    const subfolders = await adminDb()
      .collection('folders')
      .where('parentId', '==', folderId)
      .get();

    subfolders.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    const files = await adminDb()
      .collection('files')
      .where('folderId', '==', folderId)
      .get();

    files.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(folderDoc.ref);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('folder deletion error:', error);
    return NextResponse.json({ error: 'something broke' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('id');

    if (!folderId) {
      return NextResponse.json({ error: 'folder id required' }, { status: 400 });
    }

    const { parentId } = await request.json();

    const folderDoc = await adminDb().collection('folders').doc(folderId).get();
    
    if (!folderDoc.exists) {
      return NextResponse.json({ error: 'folder not found' }, { status: 404 });
    }

    const folderData = folderDoc.data();
    if (folderData?.userId !== userId) {
      return NextResponse.json({ error: 'not authorized' }, { status: 403 });
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

    await adminDb().collection('folders').doc(folderId).update({
      parentId: parentId || null,
      level,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('folder move error:', error);
    return NextResponse.json({ error: 'something broke' }, { status: 500 });
  }
}
