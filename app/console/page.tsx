'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/clientConfig';
import FolderBrowser from '@/components/console/FolderBrowser';
import PdfViewer from '@/components/console/PdfViewer';
import type { PdfFile } from '@/types';

const STORAGE_KEYS = {
  viewMode: 'nia-view-mode',
};

export default function ConsolePage() {
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    if (typeof window === 'undefined') return 'grid';
    const saved = localStorage.getItem(STORAGE_KEYS.viewMode) as 'grid' | 'table' | null;
    return saved || 'grid';
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const updateViewMode = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEYS.viewMode, mode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FolderBrowser 
        onViewPdf={setSelectedPdf} 
        viewMode={viewMode}
        onViewModeChange={updateViewMode}
      />
      {selectedPdf && (
        <PdfViewer pdf={selectedPdf} onClose={() => setSelectedPdf(null)} />
      )}
    </div>
  );
}
