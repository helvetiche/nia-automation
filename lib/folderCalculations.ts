import type { Folder, PdfFile } from '@/types';

interface FolderTotals {
  totalArea: number;
  totalIrrigatedArea: number;
  totalPlantedArea: number;
}

export function calculateFolderTotals(
  folderId: string,
  allFolders: Folder[],
  allFiles: PdfFile[]
): FolderTotals {
  let totalArea = 0;
  let totalIrrigatedArea = 0;
  let totalPlantedArea = 0;

  const pdfsInFolder = allFiles.filter(file => file.folderId === folderId && file.status === 'scanned');
  pdfsInFolder.forEach(pdf => {
    if (pdf.totalArea) totalArea += pdf.totalArea;
    if (pdf.totalIrrigatedArea) totalIrrigatedArea += pdf.totalIrrigatedArea;
    if (pdf.totalPlantedArea) totalPlantedArea += pdf.totalPlantedArea;
  });

  const subfolders = allFolders.filter(folder => folder.parentId === folderId);
  subfolders.forEach(subfolder => {
    const subfolderTotals = calculateFolderTotals(subfolder.id, allFolders, allFiles);
    totalArea += subfolderTotals.totalArea;
    totalIrrigatedArea += subfolderTotals.totalIrrigatedArea;
    totalPlantedArea += subfolderTotals.totalPlantedArea;
  });

  return { totalArea, totalIrrigatedArea, totalPlantedArea };
}
