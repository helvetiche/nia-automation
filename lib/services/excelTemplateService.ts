import ExcelJS from "exceljs";

interface IrrigatorData {
  no: number;
  name: string;
  totalPlantedArea: number;
}

interface DivisionData {
  divisionName: string;
  irrigators: IrrigatorData[];
  total: number;
}

interface ReportData {
  title: string;
  season: string;
  divisions: DivisionData[];
}

export async function generateLIPAReport(data: ReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  worksheet.columns = [{ width: 5 }, { width: 60 }, { width: 24 }];

  worksheet.pageSetup = {
    paperSize: 5,
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  };

  worksheet.views = [
    {
      showGridLines: false,
      zoomScale: 60,
      zoomScaleNormal: 100,
    },
  ];

  const titleRow = worksheet.addRow([data.title]);
  titleRow.getCell(1).font = { name: "Cambria", size: 11, bold: true };
  titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  titleRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFCCCCCC" },
  };
  worksheet.mergeCells("A1:C1");

  const seasonRow = worksheet.addRow([data.season]);
  seasonRow.getCell(1).font = { name: "Cambria", size: 11, bold: true };
  seasonRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  seasonRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFCCCCCC" },
  };
  worksheet.mergeCells("A2:C2");

  worksheet.addRow([]);

  const headerRow = worksheet.addRow([
    "NO.",
    "IRRIGATORS ASSOCIATION",
    "TOTAL PLANTED AREA",
  ]);
  headerRow.getCell(1).font = { name: "Cambria", size: 11, bold: true };
  headerRow.getCell(2).font = { name: "Cambria", size: 11, bold: true };
  headerRow.getCell(3).font = { name: "Cambria", size: 11, bold: true };
  headerRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  headerRow.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
  headerRow.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
  headerRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  headerRow.getCell(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  headerRow.getCell(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  headerRow.getCell(1).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  headerRow.getCell(2).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  headerRow.getCell(3).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  let grandTotal = 0;
  const ROWS_PER_PAGE = 65;
  let currentRow = 5;

  data.divisions.forEach((division) => {
    const cleanName = division.divisionName.replace(/\.pdf$/i, "");
    const divisionStartRow = worksheet.rowCount + 1;
    
    const divisionRowCount = 1 + division.irrigators.length + 1 + 1;
    
    if (currentRow + divisionRowCount > ROWS_PER_PAGE) {
      worksheet.getRow(divisionStartRow).addPageBreak();
      currentRow = 0;
    }
    
    const divisionRow = worksheet.addRow([cleanName]);
    divisionRow.getCell(1).font = { name: "Cambria", size: 11, bold: true };
    divisionRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFCE4D6" },
    };
    divisionRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFCE4D6" },
    };
    divisionRow.getCell(3).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFCE4D6" },
    };
    divisionRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    worksheet.mergeCells(`A${divisionRow.number}:C${divisionRow.number}`);

    division.irrigators.forEach((irrigator) => {
      const row = worksheet.addRow([
        irrigator.no,
        irrigator.name,
        irrigator.totalPlantedArea,
      ]);
      row.font = { name: "Cambria", size: 11 };
      row.getCell(1).alignment = { horizontal: "left" };
      row.getCell(3).numFmt = "#,##0.00";
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const totalRow = worksheet.addRow(["TOTAL", "", division.total]);
    totalRow.font = { name: "Cambria", size: 11, bold: true };
    totalRow.getCell(1).alignment = { horizontal: "left" };
    totalRow.getCell(3).numFmt = "#,##0.00";
    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    worksheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`);
    grandTotal += division.total;

    worksheet.addRow([]);
    
    currentRow += divisionRowCount;
  });

  const grandTotalRow = worksheet.addRow(["GRAND TOTAL", "", grandTotal]);
  worksheet.mergeCells(`A${grandTotalRow.number}:B${grandTotalRow.number}`);
  grandTotalRow.getCell(1).font = { name: "Cambria", size: 11, bold: true };
  grandTotalRow.getCell(3).font = { name: "Cambria", size: 11, bold: true };
  grandTotalRow.getCell(1).alignment = { horizontal: "left" };
  grandTotalRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF92D052" },
  };
  grandTotalRow.getCell(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF92D052" },
  };
  grandTotalRow.getCell(3).numFmt = "#,##0.00";

  worksheet.pageSetup.printArea = `A1:C${grandTotalRow.number}`;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function parseExcelTemplate(buffer: Buffer): ReportData {
  return {
    title: "LIST OF IRRIGATED AND PLANTED AREA (LIPA)",
    season: "DRY CROPPING SEASON 2025",
    divisions: [],
  };
}
