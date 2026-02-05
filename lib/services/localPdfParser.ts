import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

interface ParsedPDF {
  text: string;
  numpages: number;
}

export async function parseLocalPdf(buffer: Buffer): Promise<ParsedPDF> {
  try {
    const uint8Array = new Uint8Array(buffer);
    
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/standard_fonts/',
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    const lastPage = await pdf.getPage(numPages);
    const textContent = await lastPage.getTextContent();
    
    const lastPageText = textContent.items
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'str' in item) {
          return (item as { str: string }).str;
        }
        return '';
      })
      .filter(str => str.length > 0)
      .join(' ');

    return {
      text: lastPageText,
      numpages: numPages,
    };
  } catch (error) {
    console.error('Local PDF parsing error:', error);
    throw new Error(`server is broken while parsing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}