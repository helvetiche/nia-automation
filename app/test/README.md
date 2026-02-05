# PDF Scanning Test Lab

## Overview

The `/test` page is a sandbox environment for testing and developing the new cost-optimized PDF scanning system. It allows you to:

- Upload PDF files
- Test the scanning workflow simulation
- Experiment with table detection algorithms
- Validate data extraction logic
- Compare fast vs thorough scanning strategies
- Monitor performance metrics

**Note**: This is a simulation environment that demonstrates the workflow. The actual PDF parsing will be implemented in Phase 1 using pdf-parse library.

## Accessing the Test Page

Navigate to: `http://localhost:3000/test`

## Features

### Important: Simulation Mode

This test lab runs in **simulation mode** to demonstrate the workflow without requiring actual PDF parsing libraries. The stages execute with realistic timing and data patterns:

- **Stage timing** simulates real processing (500ms parse, 300ms detect, etc.)
- **Mock data** is generated based on file size
- **Confidence scores** are calculated using the same algorithm as production
- **Results** show what the real system will produce

When you're ready to implement Phase 1, replace the mock functions with actual pdf-parse integration.

### 1. PDF Upload
- Click the upload area to select a PDF file
- Supports files up to 50MB
- Only PDF files are accepted

### 2. Scan Strategies

#### Fast Scan (Local Only)
- Uses only local PDF parsing
- No AI API calls
- Completes in ~2 seconds
- Cost: ~$0.001 per scan
- Best for: Simple, structured documents

#### Thorough Scan (Local + AI)
- Starts with local parsing
- Uses AI validation if confidence < 60%
- Completes in ~12 seconds
- Cost: ~$0.03 per scan
- Best for: Complex or scanned documents

### 3. Test Stages

The test runs through 5 stages:

#### Stage 1: PDF Parsing
- Extracts text from all pages
- Preserves formatting and structure
- Detects page count and text length
- **Target**: < 2 seconds

#### Stage 2: Table Detection
- Identifies table structures
- Detects column headers
- Recognizes data rows
- Calculates confidence score
- **Target**: < 1 second

#### Stage 3: Data Extraction
- Normalizes column names
- Parses numeric values
- Extracts data into structured format
- Calculates totals
- **Target**: < 0.5 seconds

#### Stage 4: Confidence Validation
- Validates extracted data
- Checks data types and ranges
- Determines if AI validation needed
- Returns confidence score (0-100)
- **Target**: < 0.5 seconds

#### Stage 5: AI Validation (Optional)
- Only runs if confidence < 60%
- Only runs if strategy is "Thorough"
- Validates against original PDF
- Suggests corrections
- **Target**: < 8 seconds

### 4. Results Display

Each stage shows:
- **Status**: Success, Error, or Pending
- **Duration**: Time taken in milliseconds
- **Data**: Detailed results (expandable)
- **Error**: Error message if failed

### 5. Summary Metrics

After test completion:
- **Total Duration**: Sum of all stages
- **Success Rate**: Percentage of successful stages

## Test Data

### Sample PDFs to Test

1. **Simple Table PDF**
   - Single page with one table
   - Clear headers and data
   - Expected: Fast scan, high confidence

2. **Multi-Page PDF**
   - Multiple pages with tables
   - Consistent structure
   - Expected: Fast scan, medium-high confidence

3. **Complex Layout PDF**
   - Mixed content (text + tables)
   - Irregular formatting
   - Expected: May need AI validation

4. **Scanned PDF**
   - Image-based PDF (OCR needed)
   - Low text extraction quality
   - Expected: Requires AI validation

## Understanding Results

### Confidence Score (0-100)

- **90-100**: Excellent - Local parsing sufficient
- **70-89**: Good - Local parsing likely sufficient
- **60-69**: Fair - May benefit from AI validation
- **< 60**: Poor - AI validation recommended

### When AI Validation is Used

AI validation is triggered when:
1. Confidence score < 60%
2. Strategy is set to "Thorough"
3. Local parsing completes successfully

### Cost Breakdown

**Fast Scan**:
- PDF Parsing: $0.0001
- Table Detection: $0.0001
- Data Extraction: $0.0001
- Validation: $0.0001
- **Total**: ~$0.0004

**Thorough Scan (with AI)**:
- Local stages: $0.0004
- AI Validation: $0.001-$0.01
- **Total**: ~$0.001-$0.011

## Troubleshooting

### PDF Parsing Fails
- Check if PDF is valid and not corrupted
- Ensure PDF is not password-protected
- Try with a different PDF

### No Tables Detected
- PDF may not contain structured tables
- Tables may be images (scanned)
- Try "Thorough" scan for AI detection

### Low Confidence Score
- PDF structure is complex
- Tables have irregular formatting
- Use "Thorough" scan for AI validation

### AI Validation Fails
- Check API key configuration
- Verify Gemini API is accessible
- Check rate limits

## Development

### Adding New Test Stages

1. Create a new function in `app/api/test/scan/route.ts`
2. Add stage to results array
3. Update UI to display results
4. Document in this README

### Modifying Detection Algorithm

Edit `detectTables()` function in `app/api/test/scan/route.ts`:
- Adjust line splitting logic
- Modify confidence calculation
- Add new detection patterns

### Testing with Real Data

1. Upload actual PDFs from your system
2. Compare results with manual inspection
3. Adjust algorithms based on results
4. Document findings

## Next Steps

After testing, implement:

1. **Phase 1**: Create production PDF parser service
2. **Phase 2**: Integrate with main scan API
3. **Phase 3**: Add cost tracking and reporting
4. **Phase 4**: Update UI with new options
5. **Phase 5**: Deploy to production

## Performance Benchmarks

Target metrics for production:

| Metric | Target | Current |
|--------|--------|---------|
| PDF Parsing | < 2s | TBD |
| Table Detection | < 1s | TBD |
| Data Extraction | < 0.5s | TBD |
| Validation | < 0.5s | TBD |
| AI Validation | < 8s | TBD |
| **Total (Fast)** | **< 4s** | TBD |
| **Total (Thorough)** | **< 12s** | TBD |

## Cost Comparison

### Current System (Gemini Only)
- Per PDF: $0.15 - $2.50
- 1000 PDFs/month: $150 - $2,500

### New System (Local + Optional AI)
- Per PDF: $0.0004 - $0.011
- 1000 PDFs/month: $0.40 - $11

### Savings
- **99% reduction** for fast scans
- **98% reduction** for thorough scans
- **Payback period**: < 1 month

## Resources

- [PDF Parse Documentation](https://www.npmjs.com/package/pdf-parse)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Cost Optimization Spec](../../.kiro/specs/cost-optimized-pdf-scanning/)

## Questions?

Refer to the spec files:
- `requirements.md` - User stories and acceptance criteria
- `design.md` - Technical architecture
- `tasks.md` - Implementation tasks
