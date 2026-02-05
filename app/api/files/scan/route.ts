import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/adminConfig';
import { verifyOperator } from '@/lib/auth/middleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Folder, PdfFile } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  console.log('=== SCAN REQUEST STARTED ===');
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      console.log('ERROR: No authorization token');
      return NextResponse.json({ error: 'not authorized' }, { status: 401 });
    }

    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;
    console.log('User ID:', userId);

    const { pdfId } = await request.json();
    const calculationMethod = 'quick-final';
    const aiModel = 'gemini-2.5-flash-lite';
    
    console.log('PDF ID:', pdfId);
    console.log('Calculation Method:', calculationMethod);
    console.log('AI Model:', aiModel);

    if (!pdfId) {
      console.log('ERROR: No PDF ID provided');
      return NextResponse.json({ error: 'pdf id required' }, { status: 400 });
    }

    console.log('Fetching PDF document from Firestore...');
    const pdfDoc = await adminDb().collection('pdfs').doc(pdfId).get();
    if (!pdfDoc.exists) {
      console.log('ERROR: PDF not found in Firestore');
      return NextResponse.json({ error: 'pdf not found' }, { status: 404 });
    }

    const pdfData = pdfDoc.data();
    console.log('PDF Data:', { name: pdfData?.name, storagePath: pdfData?.storagePath, status: pdfData?.status });
    
    if (pdfData?.userId !== userId) {
      console.log('ERROR: User not authorized for this PDF');
      return NextResponse.json({ error: 'not authorized' }, { status: 403 });
    }

    if (pdfData?.status === 'scanned') {
      console.log('Resetting previously scanned document...');
      await adminDb().collection('pdfs').doc(pdfId).update({
        status: 'unscanned',
        scannedAt: null,
        pageCount: null,
        extractedData: null,
        totalArea: null,
        totalIrrigatedArea: null,
        totalPlantedArea: null,
        confidence: null,
      });
      console.log('Document reset complete');
    }

    console.log('Downloading PDF from Firebase Storage...');
    const bucket = adminStorage().bucket();
    const file = bucket.file(pdfData.storagePath);
    
    const [fileBuffer] = await file.download();
    console.log('PDF downloaded, size:', fileBuffer.length, 'bytes');
    
    const base64Pdf = fileBuffer.toString('base64');
    console.log('PDF converted to base64, length:', base64Pdf.length);
    
    console.log('Initializing model:', aiModel);
    const model = genAI.getGenerativeModel({ model: aiModel });
    
    const modelPricing = {
      'gemini-2.5-flash-lite': { input: 0.15, output: 1.25 },
    };
    
    const pricing = modelPricing['gemini-2.5-flash-lite'];
    const inputPricePerMillion = pricing.input;
    const outputPricePerMillion = pricing.output;
    
    let prompt = `You are analyzing a PDF document to extract ONLY the final totals from the LAST PAGE.

CRITICAL INSTRUCTIONS:
1. ONLY process the LAST PAGE of the PDF
2. Look for a table row that contains the word "Total" (not "Subtotal")
3. Extract ONLY the numerical values from that Total row
4. The Total row contains the final summary for the entire document

WHAT TO FIND:
- Look for any row containing "Total", "TOTAL", or "total"
- Ignore rows with "Subtotal", "Sub Total", "Grand Total"
- Extract these three values from the Total row:
  * Area (or Total Area) - the main area measurement
  * Irrigated Area - the irrigated portion  
  * Planted Area - the planted portion

COLUMN NAME RULES:
- Use spaces, NOT underscores (e.g., "Irrigated Area" not "Irrigated_Area")
- Use proper capitalization

EXAMPLE OF WHAT YOU'RE LOOKING FOR:
If you see a table like:
| Description | Area | Irrigated Area | Planted Area |
| Item 1      | 50   | 40            | 35           |
| Item 2      | 75   | 60            | 50           |
| Total       | 125  | 100           | 85           |

You should extract: Area=125, Irrigated Area=100, Planted Area=85

REQUIRED JSON FORMAT:
{
  "confidence": 95,
  "pages": [
    {
      "pageNumber": [last page number],
      "tableData": [{"Area": "125", "Irrigated Area": "100", "Planted Area": "85", "Total": "yes"}],
      "summary": "Found total row with values"
    }
  ]
}

IMPORTANT: If you cannot find a Total row, return empty values but still provide the structure.`;

    console.log('Sending request to Gemini API...');
    console.log('Prompt length:', prompt.length);
    console.log('PDF base64 length:', base64Pdf.length);
    console.log('Calculation method:', calculationMethod);
    
    const startTime = Date.now();
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Pdf,
        },
      },
      { text: prompt },
    ]);
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Gemini API responded in ${elapsedTime}s`);

    const response = result.response.text();
    const usageMetadata = result.response.usageMetadata;
    
    const inputTokens = usageMetadata?.promptTokenCount || 0;
    const outputTokens = usageMetadata?.candidatesTokenCount || 0;
    const totalTokens = usageMetadata?.totalTokenCount || 0;
    
    const inputCost = (inputTokens / 1000000) * inputPricePerMillion;
    const outputCost = (outputTokens / 1000000) * outputPricePerMillion;
    const estimatedCost = inputCost + outputCost;
    
    console.log('Token Usage:');
    console.log('- Input tokens:', inputTokens);
    console.log('- Output tokens:', outputTokens);
    console.log('- Total tokens:', totalTokens);
    console.log('- Estimated cost: $' + estimatedCost.toFixed(6));
    
    console.log('Gemini raw response length:', response.length);
    console.log('Gemini raw response preview:', response.substring(0, 1000));
    
    let extractedData;
    try {
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('Cleaned response:', cleanedResponse.substring(0, 500));
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON');
        console.log('Full extracted data:', JSON.stringify(extractedData, null, 2));
        console.log('Confidence:', extractedData.confidence);
        console.log('Number of pages:', extractedData.pages?.length || 0);
        
        if (extractedData.pages && extractedData.pages.length > 0) {
          console.log('First page data:', JSON.stringify(extractedData.pages[0], null, 2));
        }
      } else {
        console.error('ERROR: No JSON found in response');
        console.error('Full cleaned response:', cleanedResponse);
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('JSON parse error:', e);
      console.error('Response was:', response);
      return NextResponse.json({ error: 'AI response parsing failed' }, { status: 500 });
    }

    const batch = adminDb().batch();
    const pages = extractedData.pages || [];
    
    if (!Array.isArray(pages) || pages.length === 0) {
      console.error('No pages in extracted data:', extractedData);
      return NextResponse.json({ error: 'no pages extracted' }, { status: 500 });
    }
    
    const pageCount = pages.length;
    console.log(`Storing ${pageCount} pages for PDF ${pdfId}`);

    const extractedPages = pages.map(pageData => ({
      pageNumber: pageData.pageNumber,
      tableData: Array.isArray(pageData.tableData) ? pageData.tableData : [],
      summary: pageData.summary || '',
    }));

    let totalArea = 0;
    let totalIrrigatedArea = 0;
    let totalPlantedArea = 0;

    console.log('Starting calculation with last page scan method');
    console.log('Total extracted pages:', extractedPages.length);
    
    const lastPage = extractedPages[extractedPages.length - 1];
    console.log('Last page number:', lastPage?.pageNumber);
    console.log('Last page has', lastPage?.tableData?.length || 0, 'rows');
    console.log('Last page table data:', JSON.stringify(lastPage?.tableData, null, 2));
    
    if (lastPage && lastPage.tableData) {
      console.log('Processing', lastPage.tableData.length, 'rows from last page');
      
      for (let i = 0; i < lastPage.tableData.length; i++) {
        const row = lastPage.tableData[i];
        console.log(`\n--- Processing Row ${i + 1} ---`);
        console.log('Row data:', JSON.stringify(row, null, 2));
        
        const rowValues = Object.values(row).map(v => String(v).toLowerCase());
        console.log('Row values (lowercase):', rowValues);
        
        const hasTotal = rowValues.some(v => {
          const cleanValue = v.trim();
          const matches = cleanValue === 'total' || 
                         cleanValue === 'totals' ||
                         cleanValue.startsWith('total ') ||
                         cleanValue.endsWith(' total');
          console.log(`Checking "${cleanValue}" for total: ${matches}`);
          return matches;
        });
        
        const hasSubtotal = rowValues.some(v => {
          const cleanValue = v.trim();
          const matches = cleanValue.includes('subtotal') || 
                         cleanValue.includes('sub total') ||
                         cleanValue.includes('sub-total') ||
                         cleanValue.includes('grand total') ||
                         cleanValue.includes('final total');
          console.log(`Checking "${cleanValue}" for subtotal: ${matches}`);
          return matches;
        });
        
        const isTotalRow = hasTotal && !hasSubtotal;
        
        console.log('Has total:', hasTotal, 'Has subtotal:', hasSubtotal, 'Is total row:', isTotalRow);
        
        if (isTotalRow) {
          console.log('✅ Found valid Total row!');
          console.log('Row keys:', Object.keys(row));
          
          const areaKeys = [
            'area', 'Area', 'AREA', 
            'total area', 'Total Area', 'TOTAL AREA',
            'total_area', 'Total_Area', 'TOTAL_AREA'
          ];
          const irrigatedKeys = [
            'irrigated', 'Irrigated', 'IRRIGATED', 
            'irrigated area', 'Irrigated Area', 'IRRIGATED AREA',
            'irrigated_area', 'Irrigated_Area', 'IRRIGATED_AREA'
          ];
          const plantedKeys = [
            'planted', 'Planted', 'PLANTED', 
            'planted area', 'Planted Area', 'PLANTED AREA',
            'planted_area', 'Planted_Area', 'PLANTED_AREA'
          ];

          console.log('Searching for area values...');
          for (const key of areaKeys) {
            if (key in row && row[key]) {
              console.log(`Found area key "${key}" with value:`, row[key]);
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              console.log(`Parsed area value: ${value}`);
              if (!isNaN(value)) {
                console.log(`✅ Set Total Area: ${value} from key: ${key}`);
                totalArea = value;
                break;
              }
            }
          }

          console.log('Searching for irrigated values...');
          for (const key of irrigatedKeys) {
            if (key in row && row[key]) {
              console.log(`Found irrigated key "${key}" with value:`, row[key]);
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              console.log(`Parsed irrigated value: ${value}`);
              if (!isNaN(value)) {
                console.log(`✅ Set Total Irrigated: ${value} from key: ${key}`);
                totalIrrigatedArea = value;
                break;
              }
            }
          }

          console.log('Searching for planted values...');
          for (const key of plantedKeys) {
            if (key in row && row[key]) {
              console.log(`Found planted key "${key}" with value:`, row[key]);
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              console.log(`Parsed planted value: ${value}`);
              if (!isNaN(value)) {
                console.log(`✅ Set Total Planted: ${value} from key: ${key}`);
                totalPlantedArea = value;
                break;
              }
            }
          }
          break;
        } else if (hasSubtotal) {
          console.log('❌ Skipping subtotal row:', rowValues);
        } else {
          console.log('❌ Not a total row');
        }
      }
    } else {
      console.log('❌ No last page or table data found');
    }
    console.log('Last page scan results - Area:', totalArea, 'Irrigated:', totalIrrigatedArea, 'Planted:', totalPlantedArea);

    if (totalArea === 0 && totalIrrigatedArea === 0 && totalPlantedArea === 0) {
      console.log('⚠️  No totals found with strict matching, trying fallback approach...');
      
      if (lastPage && lastPage.tableData) {
        for (let i = 0; i < lastPage.tableData.length; i++) {
          const row = lastPage.tableData[i];
          console.log(`Fallback: Checking row ${i + 1}:`, JSON.stringify(row, null, 2));
          
          const areaKeys = ['area', 'Area', 'AREA', 'total area', 'Total Area', 'TOTAL AREA'];
          const irrigatedKeys = ['irrigated', 'Irrigated', 'IRRIGATED', 'irrigated area', 'Irrigated Area', 'IRRIGATED AREA'];
          const plantedKeys = ['planted', 'Planted', 'PLANTED', 'planted area', 'Planted Area', 'PLANTED AREA'];

          let foundAnyValue = false;
          
          for (const key of areaKeys) {
            if (key in row && row[key] && totalArea === 0) {
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              if (!isNaN(value) && value > 0) {
                console.log(`Fallback: Found Area: ${value} from key: ${key}`);
                totalArea = value;
                foundAnyValue = true;
              }
            }
          }

          for (const key of irrigatedKeys) {
            if (key in row && row[key] && totalIrrigatedArea === 0) {
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              if (!isNaN(value) && value > 0) {
                console.log(`Fallback: Found Irrigated: ${value} from key: ${key}`);
                totalIrrigatedArea = value;
                foundAnyValue = true;
              }
            }
          }

          for (const key of plantedKeys) {
            if (key in row && row[key] && totalPlantedArea === 0) {
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              if (!isNaN(value) && value > 0) {
                console.log(`Fallback: Found Planted: ${value} from key: ${key}`);
                totalPlantedArea = value;
                foundAnyValue = true;
              }
            }
          }
          
          if (foundAnyValue) {
            console.log('✅ Fallback extraction successful');
            break;
          }
        }
      }
    }

    console.log(`Calculated totals - Area: ${totalArea}, Irrigated: ${totalIrrigatedArea}, Planted: ${totalPlantedArea}`);

    const confidenceScore = extractedData.confidence || 0;
    console.log(`Confidence score: ${confidenceScore}`);

    console.log('=== FINAL RESULTS SUMMARY ===');
    console.log('Total Area:', totalArea);
    console.log('Total Irrigated Area:', totalIrrigatedArea);
    console.log('Total Planted Area:', totalPlantedArea);
    console.log('Confidence Score:', confidenceScore);
    console.log('Page Count:', pageCount);
    console.log('AI Model:', aiModel);
    console.log('Estimated Cost:', estimatedCost);
    console.log('==============================');

    batch.update(adminDb().collection('pdfs').doc(pdfId), {
      status: 'scanned',
      scannedAt: Date.now(),
      pageCount,
      extractedData: extractedPages,
      totalArea: totalArea || 0,
      totalIrrigatedArea: totalIrrigatedArea || 0,
      totalPlantedArea: totalPlantedArea || 0,
      confidence: confidenceScore,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      aiModel: aiModel,
    });

    console.log('Committing batch update to Firestore...');
    await batch.commit();
    console.log('Batch committed successfully');

    console.log('Updating usage metrics...');
    const metricsRef = adminDb().collection('usage').doc('metrics');
    await adminDb().runTransaction(async (transaction) => {
      const metricsDoc = await transaction.get(metricsRef);
      
      if (!metricsDoc.exists) {
        transaction.set(metricsRef, {
          inputTokens: inputTokens,
          outputTokens: outputTokens,
          totalCost: estimatedCost,
          lastUpdated: Date.now(),
        });
      } else {
        const currentData = metricsDoc.data();
        transaction.update(metricsRef, {
          inputTokens: (currentData?.inputTokens || 0) + inputTokens,
          outputTokens: (currentData?.outputTokens || 0) + outputTokens,
          totalCost: (currentData?.totalCost || 0) + estimatedCost,
          lastUpdated: Date.now(),
        });
      }
    });
    console.log('Usage metrics updated');

    console.log('Updating folder totals...');
    try {
      const { calculateFolderTotals } = await import('@/lib/folderCalculations');
      
      const foldersSnapshot = await adminDb()
        .collection('folders')
        .where('userId', '==', userId)
        .get();

      const filesSnapshot = await adminDb()
        .collection('pdfs')
        .where('userId', '==', userId)
        .get();

      const allFolders = foldersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Folder[];

      const allFiles = filesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PdfFile[];

      const folderBatch = adminDb().batch();
      
      for (const folder of allFolders) {
        const totals = calculateFolderTotals(folder.id, allFolders, allFiles);
        
        folderBatch.update(adminDb().collection('folders').doc(folder.id), {
          totalArea: totals.totalArea || 0,
          totalIrrigatedArea: totals.totalIrrigatedArea || 0,
          totalPlantedArea: totals.totalPlantedArea || 0,
        });
      }

      await folderBatch.commit();
      console.log('Folder totals updated');
    } catch (folderError) {
      console.error('Folder update error (non-critical):', folderError);
    }

    console.log('=== SCAN COMPLETED SUCCESSFULLY ===');
    console.log('Page count:', pageCount);
    console.log('Total Area:', totalArea);
    console.log('Total Irrigated:', totalIrrigatedArea);
    console.log('Total Planted:', totalPlantedArea);
    
    return NextResponse.json({ success: true, pageCount });
  } catch (error) {
    console.error('=== SCAN ERROR ===');
    console.error('Error details:', error);
    return NextResponse.json({ error: 'scan failed' }, { status: 500 });
  }
}
