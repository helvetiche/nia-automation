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
  notice?: string;
}

export interface PdfFile {
  id: string;
  name: string;
  folderId: string;
  status: "unscanned" | "scanned" | "summary-scanned";
  uploadedAt: number;
  scannedAt?: number;
  pageCount?: number;
  storageUrl: string;
  userId: string;
  extractedData?: PdfPage[];
  summaryData?: SummaryData[];
  totalArea?: number;
  totalIrrigatedArea?: number;
  totalPlantedArea?: number;
  confidence?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  aiModel?: string;
  scanType?: "total" | "summary";
  pageNumbers?: string;
  notice?: string;
}

export interface PdfPage {
  pageNumber: number;
  tableData: Record<string, unknown>[];
  summary: string;
}

export interface SummaryData {
  id: string;
  name: string;
  totalArea: number;
  confidence: number;
  usage: number;
  notice?: string;
}

export interface Template {
  id: string;
  name: string;
  fileName: string;
  storageUrl: string;
  storagePath: string;
  uploadedAt: number;
  type: string;
}

export interface ReportSettings {
  id: string;
  userId: string;
  boldKeywords: string[];
  capitalizeKeywords: string[];
  updatedAt: number;
}
