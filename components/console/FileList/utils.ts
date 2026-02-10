import type { PdfFile } from "@/types";

export const calculateTotals = (file: PdfFile) => {
  return {
    totalArea: file.totalArea || 0,
    totalIrrigatedArea: file.totalIrrigatedArea || 0,
    totalPlantedArea: file.totalPlantedArea || 0,
  };
};

export const getRowClassName = (
  hasNotice: boolean,
  color: string,
  gradientHoverMap: Record<string, string>,
) => {
  if (hasNotice) {
    return "transition bg-gradient-to-l from-orange-100/60 to-transparent hover:from-orange-200/80 hover:to-transparent";
  }
  return `transition ${gradientHoverMap[color] || "hover:bg-gradient-to-l hover:from-blue-500/40 hover:to-transparent"}`;
};
