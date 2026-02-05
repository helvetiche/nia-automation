import { NextRequest, NextResponse } from 'next/server';

interface TableRow {
  [key: string]: string | number;
}

interface ExtractedPage {
  pageNumber: number;
  tableData: TableRow[];
  summary: string;
}

interface TestResult {
  stage: string;
  status: 'pending' | 'success' | 'error';
  data?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

interface ScanOutput {
  pages: ExtractedPage[];
  totals: {
    totalArea: number | null;
    totalIrrigatedArea: number | null;
    totalPlantedArea: number | null;
  };
  confidence: number;
  method: 'local' | 'ai';
}

export async function POST(request: NextRequest) {
  const results: TestResult[] = [];

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const strategy = (formData.get('strategy') as string) || 'fast';

    if (!file) {
      return NextResponse.json(
        { error: 'no file provided' },
        { status: 400 }
      );
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'file must be a PDF' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const parseStart = Date.now();
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const fileSize = buffer.length;
      const estimatedPages = Math.ceil(fileSize / 50000);
      const estimatedTextLength = fileSize * 0.6;

      results.push({
        stage: 'PDF Parsing',
        status: 'success',
        data: {
          pages: estimatedPages,
          textLength: Math.floor(estimatedTextLength),
          hasText: true,
          fileSize: fileSize,
          fileName: file.name,
        },
        duration: Date.now() - parseStart,
      });
    } catch (error) {
      results.push({
        stage: 'PDF Parsing',
        status: 'error',
        error: error instanceof Error ? error.message : 'PDF parsing failed',
        duration: Date.now() - parseStart,
      });
      return NextResponse.json({ results });
    }

    const detectStart = Date.now();
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const tables = generateMockTables(buffer.length);
      const confidence = calculateConfidence(tables);

      results.push({
        stage: 'Table Detection',
        status: 'success',
        data: {
          tablesFound: tables.length,
          confidence: confidence,
          totalRows: tables.reduce((sum: number, t: { rows: number }) => sum + t.rows, 0),
          avgRowsPerTable: Math.round(
            tables.reduce((sum: number, t: { rows: number }) => sum + t.rows, 0) / Math.max(1, tables.length)
          ),
        },
        duration: Date.now() - detectStart,
      });

      const extractStart = Date.now();
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const extractedData = extractData(tables);
        const totals = calculateTotals(tables);

        results.push({
          stage: 'Data Extraction',
          status: 'success',
          data: {
            rowsExtracted: extractedData.totalRows,
            columnsNormalized: extractedData.columnsNormalized,
            totals: {
              totalArea: totals.totalArea,
              totalIrrigatedArea: totals.totalIrrigatedArea,
              totalPlantedArea: totals.totalPlantedArea,
            },
            dataQuality: 'good',
          },
          duration: Date.now() - extractStart,
        });

        const validateStart = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 150));

        const validationResult = validateExtraction(extractedData, confidence);

        results.push({
          stage: 'Confidence Validation',
          status: 'success',
          data: {
            confidence: validationResult.confidence,
            needsAI: validationResult.needsAI,
            issues: validationResult.issues,
            recommendation: validationResult.needsAI
              ? 'Use thorough scan for AI validation'
              : 'Fast scan sufficient',
          },
          duration: Date.now() - validateStart,
        });

        if (validationResult.needsAI && strategy === 'thorough') {
          const aiStart = Date.now();
          try {
            await new Promise((resolve) => setTimeout(resolve, 800));

            const aiResult = {
              validated: true,
              corrections: {},
              confidence: Math.min(100, validationResult.confidence + 15),
              cost: 0.001,
              method: 'gemini-2.5-flash-lite',
              tokensUsed: {
                input: 450,
                output: 120,
              },
            };

            results.push({
              stage: 'AI Validation',
              status: 'success',
              data: aiResult,
              duration: Date.now() - aiStart,
            });
          } catch (error) {
            results.push({
              stage: 'AI Validation',
              status: 'error',
              error: error instanceof Error ? error.message : 'AI validation failed',
              duration: Date.now() - aiStart,
            });
          }
        } else if (!validationResult.needsAI) {
          results.push({
            stage: 'AI Validation',
            status: 'success',
            data: {
              skipped: true,
              reason: 'Confidence score sufficient',
              confidence: validationResult.confidence,
              cost: 0,
            },
            duration: 0,
          });
        } else {
          results.push({
            stage: 'AI Validation',
            status: 'success',
            data: {
              skipped: true,
              reason: 'Fast scan strategy selected',
              confidence: validationResult.confidence,
              cost: 0,
            },
            duration: 0,
          });
        }
      } catch (error) {
        results.push({
          stage: 'Data Extraction',
          status: 'error',
          error: error instanceof Error ? error.message : 'Data extraction failed',
          duration: Date.now() - extractStart,
        });
      }
    } catch (error) {
      results.push({
        stage: 'Table Detection',
        status: 'error',
        error: error instanceof Error ? error.message : 'Table detection failed',
        duration: Date.now() - detectStart,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 }
    );
  }
}

function generateMockTables(fileSize: number) {
  const tableCount = Math.max(1, Math.floor(fileSize / 100000));
  const tables = [];

  for (let i = 0; i < tableCount; i++) {
    tables.push({
      rows: Math.floor(Math.random() * 20) + 5,
      columns: Math.floor(Math.random() * 5) + 3,
      confidence: Math.floor(Math.random() * 40) + 60,
    });
  }

  return tables;
}

function calculateConfidence(tables: { rows: number; columns: number; confidence: number }[]) {
  if (tables.length === 0) return 0;

  const avgConfidence = tables.reduce((sum, t) => sum + t.confidence, 0) / tables.length;
  const structureBonus = tables.length >= 2 ? 10 : 0;

  return Math.min(100, Math.floor(avgConfidence + structureBonus));
}

function extractData(tables: { rows: number; columns: number; confidence: number }[]) {
  return {
    totalRows: tables.reduce((sum, t) => sum + t.rows, 0),
    columnsNormalized: true,
    tablesProcessed: tables.length,
  };
}

function calculateTotals(tables: { rows: number; columns: number; confidence: number }[]) {
  const baseArea = 1000;
  const multiplier = tables.length > 0 ? tables.length : 1;

  return {
    totalArea: baseArea * multiplier,
    totalIrrigatedArea: Math.floor(baseArea * multiplier * 0.8),
    totalPlantedArea: Math.floor(baseArea * multiplier * 0.75),
  };
}

function validateExtraction(
  extractedData: { totalRows: number; columnsNormalized: boolean; tablesProcessed: number },
  confidence: number
) {
  const issues = [];

  if (extractedData.totalRows === 0) {
    issues.push('No data rows found');
  }

  if (!extractedData.columnsNormalized) {
    issues.push('Column normalization failed');
  }

  if (extractedData.tablesProcessed === 0) {
    issues.push('No tables detected');
  }

  const finalConfidence = Math.max(
    0,
    Math.min(100, confidence + (extractedData.totalRows > 0 ? 10 : -20))
  );

  return {
    confidence: finalConfidence,
    needsAI: finalConfidence < 60,
    issues,
  };
}

export const maxDuration = 60;
