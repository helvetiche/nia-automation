export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  createdAt: number;
  userId: string;
}

export interface PdfFile {
  id: string;
  name: string;
  folderId: string;
  status: 'unscanned' | 'scanned';
  uploadedAt: number;
  scannedAt?: number;
  pageCount?: number;
  storageUrl: string;
  userId: string;
}

export interface PdfPage {
  id: string;
  pdfId: string;
  pageNumber: number;
  tableData: Record<string, unknown>;
  screenshotUrl: string;
}
