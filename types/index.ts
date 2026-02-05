export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  createdAt: number;
  userId: string;
  color?: string;
  icon?: string;
  description?: string;
  totalArea?: number;
  totalIrrigatedArea?: number;
  totalPlantedArea?: number;
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
  extractedData?: PdfPage[];
  totalArea?: number;
  totalIrrigatedArea?: number;
  totalPlantedArea?: number;
  confidence?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  aiModel?: string;
}

export interface PdfPage {
  pageNumber: number;
  tableData: Record<string, unknown>[];
  summary: string;
}
