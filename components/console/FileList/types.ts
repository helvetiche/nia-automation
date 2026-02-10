import type { Folder, PdfFile } from "@/types";

export interface FileListProps {
  folders: Folder[];
  files: PdfFile[];
  allFolders: Folder[];
  onSelectFolder: (folderId: string | null) => void;
  onRefresh: () => void;
  isSelectMode: boolean;
  selectedPdfs: Set<string>;
  onToggleSelectPdf: (id: string) => void;
  onToggleSelectAllPdfs: (ids: string[]) => void;
  currentlyScanning: string | null;
  estimatedTimeRemaining: number;
  loading?: boolean;
}

export interface NoticePopoverState {
  isOpen: boolean;
  type: "folder" | "file" | "summary";
  id: string;
  summaryId?: string;
  currentNotice?: string;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export interface ConfirmDeleteState {
  isOpen: boolean;
  fileId: string;
  associationId: string;
  associationName: string;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export interface EditingAreaState {
  fileId: string;
  associationId?: string;
  currentValue: number;
}

export interface EditingNameState {
  fileId: string;
  associationId?: string;
  currentValue: string;
}
